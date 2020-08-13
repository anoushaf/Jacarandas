const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 10,
  database: "*********",
  host: "classmysql.engr.oregonstate.edu",
  multipleStatements: true,
  password: "******",
  user: "*******"
});

module.exports.pool = pool;
