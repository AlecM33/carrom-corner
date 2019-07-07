var mysql = require('mysql');
port = process.env.PORT || 3001;

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'CHANGEME',
  password: 'CHANGEME',
  database: 'carrom-corner'
});

connection.connect();
module.exports = connection;
