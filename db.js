const mysql = require('mysql2');
require('dotenv').config();

const dbURL = process.env.JAWSDB_URL;
const dbConfig = new URL(dbURL);

// Parse the MySQL URL into individual components
const connection = mysql.createConnection({
  host: dbConfig.hostname,
  user: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.pathname.substring(1),
  port: dbConfig.port,
});

exports.connection = connection;
