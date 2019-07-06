var mysql = require('mysql');
port = process.env.PORT || 3001;

// TODO: Configure environments.ts, import environment object, and use that instead
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'CHANGEME',
  password: 'CHANGEME',
  database: 'carrom-corner'
});

connection.connect();
module.exports = connection;
