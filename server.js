const http = require("http");
const url = require("url");
const connection = require("./db").connection;

const dictAPIRoot = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const GET = "GET";
const POST = "POST";
const dictRoot = "/api/definitions";
const dbRoot = "/api/db";
const dictionary = [];
let queryCount = 0;
let recCount = 0;

const insertSql = `
  INSERT INTO patients (name, dateOfBirth)
  VALUES
  ('Sara Brown', '1901-01-01'),
  ('John Smith', '1941-01-01'),
  ('Jack Ma', '1961-01-30'),
  ('Elon Musk', '1999-01-01');
;`;

const blockedQueries = ['DELETE', 'UPDATE', 'DROP', 'ALTER'];

http
  .createServer((req, res) => {
    // Set CORS headers for all responses
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    const { method, url: reqUrl } = req;
    const { query, pathname } = url.parse(reqUrl, true);

    // Connect to the database
    connection.connect((err) => {
      if (err) {
        console.error("Error connecting to the database:", err.stack);
        serverResponse(res, 500, "Error connecting to the database");
        return;
      }
    });

    // Handle preflight (OPTIONS) requests
    if (req.method === "OPTIONS") {
      res.writeHead(204); // No Content
      res.end();
      return;
    }

    // .../api/definitions?word=*** => Get definition from dictionary record
    if (method === GET && pathname === dictRoot && query.word) {
      queryCount++;
      const word = query.word.toLowerCase();
      const searchObj = dictionary.find((obj) => obj.word === word);

      if (searchObj) {
        serverResponse(res, 200, JSON.stringify(searchObj));
      } else {
        const data = JSON.stringify({
          queryCount,
          word,
          warning: `Word: ${word} Not Found from Record`,
        });
        serverResponse(res, 404, data);
      }

      // .../api/definitions/add => to add word: definition to dictionary record
    } else if (method === POST && pathname === dictRoot + "/add") {
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
          const data = JSON.stringify({
            word,
            warning: `Warning! ${word} already exists in record.`,
          })
          serverResponse(res, 500, data);
          return;
        }
        recCount++;
        const storedObj = { recCount, word, definition };
        dictionary.push(storedObj);
        const data = JSON.stringify({
          storedObj,
          message: `Word: ${word} successfully added to dictionary`,
        });
        serverResponse(res, 200, data);
      });

      // .../api/definitions for display all words in record
    } else if (method === GET && pathname === dictRoot) {
      serverResponse(res, 200, JSON.stringify(dictionary));
      // Search Word from free dictionary API for dev testing purpose
    } else if (method === POST && pathname === dictRoot) {
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
            serverResponse(res, 200, JSON.stringify(searchObj));
          })
          .catch((err) => {
            serverResponse(res, 404, JSON.stringify({ word, warning: "Word Definition Not Found" }));
          });
      });
    } else if (method === POST && pathname === dbRoot + "/add") {
      let body = "";
      req.on("data", (chunk) => {
        if (chunk) {
          body += chunk.toString();
        }
      });
      req.on("end", () => {
        let query = insertSql;
        connection.query(query, (error) => {
          if (error) { serverResponse(res, 500, "Error inserting data into the database"); return}
          serverResponse(res, 200, "Data inserted successfully");
        });
      });
    } else if (method === POST && pathname === dbRoot + "/insert") {
      let body = "";
      req.on("data", (chunk) => {
        if (chunk) {
          body += chunk.toString();
        }
      });
      req.on("end", () => {
        let { query } = JSON.parse(body);
        if (blockedQueries.some((blockedQuery) => query.toUpperCase().includes(blockedQuery))) {
          serverResponse(res, 400, "Query not allowed");
          return;
        }
        connection.query(query, (error) => {
          if (error) {serverResponse(res, 500, "Error inserting data into the database"); return}
          serverResponse(res, 200, "INSERT query success");
        });
      });
    } else if (method === GET && new RegExp(`^${dbRoot}/.*$`).test(pathname)) {
      const pathParts = pathname.split("/");
      const query = pathParts[pathParts.length - 1];
      if (query) {
        const decodedQuery = decodeURIComponent(query)
          .trim()
          .replace(/^["]|["]$/g, "");
        if (blockedQueries.some((blockedQuery) => decodedQuery.toUpperCase().includes(blockedQuery))) {
          serverResponse(res, 400, "Query not allowed");
          return;
        }
        connection.query(decodedQuery, (error, results) => {
          if (error) {serverResponse(res, 500, "Error querying the database"); return}
          serverResponse(res, 200, JSON.stringify(results));
        });
      } else {
        serverResponse(res, 400, "Bad request");
      }

    } else {
      serverResponse(res, 404, "Page not found");
    }
  })
  .listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port 3000");
  });

function serverResponse(res, status, message) {
  res.writeHead(status, { "Content-Type": "text/html" });
  res.write(message);
  res.end();
}
