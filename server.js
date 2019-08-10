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

// add api resources here
const player = require("./src/app/api/players");
const tournament = require ("./src/app/api/tournaments");
const round = require("./src/app/api/rounds");
const pool = require("./src/app/api/pools");
const pool_placements = require("./src/app/api/pool_placements");
const teams = require("./src/app/api/teams");
const games = require("./src/app/api/games");
const playoffs = require("./src/app/api/playoffs");
const brackets = require ("./src/app/api/brackets");
app.use("/api/brackets", brackets);
app.use("/api/playoffs", playoffs);
app.use("/api/teams", teams);
app.use("/api/players", player);
app.use("/api/tournaments", tournament);
app.use("/api/rounds", round);
app.use("/api/pools", pool);
app.use("/api/pool_placements", pool_placements);
app.use("/api/games", games);


app.use(express.static(__dirname + '/dist/'));
app.get('/*', function(req,res) {
  res.sendFile(path.join(__dirname + '/dist/index.html'));

});
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.set('port', 3001);

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 3001);
