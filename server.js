//Install express server
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// Serve only the static files form the dist directory
//app.use(express.static(__dirname + '/dist'));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

const player = require("./src/app/api/players");
const tournament = require ("./src/app/api/tournaments");
app.use("/api/players", player);
app.use("/api/tournaments", tournament);

app.get('/*', function(req,res) {
  res.sendFile(path.join(__dirname+'/dist/index.html'));
});


app.set('port', 3001);

// Start the app by listening on the default Heroku port
app.listen(3001);
