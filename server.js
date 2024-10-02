const http = require("http");
const url = require("url");
const dictAPIRoot = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const GET = "GET";
const POST = "POST";
const endPointRoot = "/api/definitions";
const reqSet = new Set();
const dictionary = [];
let reqCount = 0;

http
  .createServer((req, res) => {
    // Set CORS headers for all responses
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    const { method, url: reqUrl } = req;
    const { query, pathname } = url.parse(reqUrl, true);

    // Handle preflight (OPTIONS) requests
    if (req.method === "OPTIONS") {
      res.writeHead(204); // No Content
      res.end();
      return;
    }

    // .../api/definitions?word=***
    if (method === GET && pathname === endPointRoot && query.word) {
      const word = query.word.toLowerCase();

      // API call to get definition
      fetch(`${dictAPIRoot}${word}`)
        .then((response) => response.json())
        .then((data) => {
          const definition = data[0].meanings[0].definitions[0].definition;
          const searchObj = { word, definition };
          res.writeHead(
            200,
            { "Content-Type": "text/html" },
            { "Access-Control-Allow-Origin": "*" }
          );
          res.write(JSON.stringify(searchObj));
          res.end();
        })
        .catch((err) => {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.write(JSON.stringify({ word, warning: "Word Not Found" }));
          res.end();
        });

      // .../api/definitions for display all words
    } else if (method === GET && pathname === endPointRoot) {
        res.writeHead(
            200,
            { "Content-Type": "text/html" },
            { "Access-Control-Allow-Origin": "*" }
        );
        res.write(JSON.stringify(dictionary));
        res.end();

      // Search Word
    } else if (method === POST && pathname === endPointRoot) {
      let body = "";
      req.on("data", (chunk) => {
        if (chunk) {
          body += chunk.toString();
        }
      });
      req.on("end", () => {
        let { word } = JSON.parse(body);
        word = word.toLowerCase();
        if (reqSet.has(word)) {
          res.writeHead(
            500,
            { "Content-Type": "text/html" },
            { "Access-Control-Allow-Origin": "*" }
          );
          res.write(
            JSON.stringify({
              word,
              warning: `Warning! ${word} already exists in record or was searched.`,
            })
          );
          res.end();
          return;
        }
        reqSet.add(word);
        reqCount++;
        fetch(`${dictAPIRoot}${word}`)
          .then((response) => response.json())
          .then((data) => {
            const definition = data[0].meanings[0].definitions[0].definition;
            const searchObj = { reqCount, word, definition };
            dictionary.push(searchObj);
            res.writeHead(
              200,
              { "Content-Type": "text/html" },
              { "Access-Control-Allow-Origin": "*" }
            );
            res.write(JSON.stringify(searchObj));
            res.end();
          })
          .catch((err) => {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.write(JSON.stringify({ reqCount, word, definition: "Not Found" }));
            res.end();
          });
      });

      // 404 Not Found
    } else {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.write("404 Not Found");
      res.end();
    }
  })
  .listen( process.env.PORT || 3000, () => {
    console.log("Server is running on port 3000");
  });
