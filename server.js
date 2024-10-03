const http = require("http");
const url = require("url");
const dictAPIRoot = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const GET = "GET";
const POST = "POST";
const endPointRoot = "/api/definitions";
const dictionary = [];
let queryCount = 0;
let recCount = 0;

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

    // .../api/definitions?word=*** => Get definition from free dictionary API
    if (method === GET && pathname === endPointRoot && query.word) {
      const word = query.word.toLowerCase();

      const searchObj = dictionary.find((obj) => obj.word === word);
      if (searchObj) {
        res.writeHead(
          200,
          { "Content-Type": "text/html" },
          { "Access-Control-Allow-Origin": "*" }
        );
        res.write(JSON.stringify(searchObj));
        res.end();
      } else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.write(
          JSON.stringify({
            word,
            warning: "Word Not Found from Record",
          })
        );
        res.end();
      }

      // .../api/definitions/add => to add word: definition to dictionary record
    } else if (method === POST && pathname === endPointRoot + "/add") {
      let body = "";
      req.on("data", (chunk) => {
        if (chunk) {
          body += chunk.toString();
        }
      });
      req.on("end", () => {
        let { word, definition } = JSON.parse(body);
        word = word.toLowerCase();
        if (dictionary.some((obj) => obj.word === word)) {
          res.writeHead(
            500,
            { "Content-Type": "text/html" },
            { "Access-Control-Allow-Origin": "*" }
          );
          res.write(
            JSON.stringify({
              word,
              warning: `Warning! ${word} already exists in record.`,
            })
          );
          res.end();
          return;
        }
        recCount++;
        const storedObj = { recCount, word, definition };
        dictionary.push(storedObj);
        res.writeHead(
          200,
          { "Content-Type": "text/html" },
          { "Access-Control-Allow-Origin": "*" }
        );
        res.write(
          JSON.stringify({
            storedObj,
            message: `${word} successfully added to dictionary`,
          })
        );
        res.end();
      });

      // .../api/definitions for display all words in record
    } else if (method === GET && pathname === endPointRoot) {
      res.writeHead(
        200,
        { "Content-Type": "text/html" },
        { "Access-Control-Allow-Origin": "*" }
      );
      res.write(JSON.stringify(dictionary));
      res.end();

      // Search Word from free dictionary API
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
            res.writeHead(404, { "Content-Type": "text/html" });
            res.write(
              JSON.stringify({ word, warning: "Word Definition Not Found" })
            );
            res.end();
          });
      });
      // Search word from records
    } else if (method === POST && pathname === endPointRoot + "/search") {
      queryCount++;
      let body = "";
      req.on("data", (chunk) => {
        if (chunk) {
          body += chunk.toString();
        }
      });
      req.on("end", () => {
        let { word } = JSON.parse(body);
        word = word.toLowerCase();
        const searchObj = dictionary.find((obj) => obj.word === word);
        if (searchObj) {
          res.writeHead(
            200,
            { "Content-Type": "text/html" },
            { "Access-Control-Allow-Origin": "*" }
          );
          res.write(JSON.stringify({ queryCount, searchObj })); // not sure
          res.end();
        } else {
          res.writeHead(404, { "Content-Type": "text/html" });
          res.write(
            JSON.stringify({
              queryCount,
              word,
              warning: "Word Not Found from Record",
            })
          );
          res.end();
        }
      });

      // 404 Not Found
    } else {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.write("404 Not Found");
      res.end();
    }
  })
  .listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port 3000");
  });
