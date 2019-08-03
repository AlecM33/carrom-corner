const express = require('express');
const router = express.Router();

const connection = require('./db');

// POST team
router.post('/post', function(req, res) {
  const team = req.body;
  const query = 'INSERT INTO Teams VALUES (NULL, ?, ?, ?);';
  const filter = [team.tournamentId, team.player1Id, team.player2Id];
  connection.query(query, filter, connection.handleRequest(res,'POST team'));
});

// GET all Teams for a tournament
router.get('/get/:tournament_id', function(req, res) {
  const tournyid = req.params.tournament_id;
  const query = 'SELECT * FROM Teams WHERE tourny_id = ?';
  const filter = [tournyid];
  connection.query(query, filter, connection.handleRequest(res,'GET all teams'));
});

// GET Teams containing a player
router.get('/player/:player_id', function(req, res) {
  const query = 'SELECT * FROM Teams WHERE player1_id = ? OR player2_id = ?';
  const filter = [req.params.player_id, req.params.player_id];
  connection.query(query, filter, connection.handleRequest(res,'GET teams with player ' + req.params.player_id));
});



module.exports = router;
