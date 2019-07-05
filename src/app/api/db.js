var mysql = require('mysql');
port = process.env.PORT || 3001;

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Ellie112196',
  database: 'carrom-corner'
});

connection.connect();
module.exports = connection;
