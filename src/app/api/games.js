const express = require('express');
const router = express.Router();

const connection = require('./db');

// POST Singles game
router.post('/singles/post', function(req, res) {
  const game = req.body;
  const query = 'INSERT INTO Singles_Games VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL);';
  const filter = [game.tournamentId, game.roundId, game.poolId, game.playoff, game.playoffId, game.player1Id, game.player2Id];
  connection.query(query, filter, connection.handleRequest(res,'POST singles game'));
});

// POST Doubles game
router.post('/doubles/post', function(req, res) {
  const game = req.body;
  const query = 'INSERT INTO Doubles_Games VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL);';
  const filter = [game.tournamentId, game.roundId, game.poolId, game.playoff, game.playoffId, game.team1Id, game.team2Id];
  connection.query(query, filter, connection.handleRequest(res,'POST doubles game'));
});

// GET games for a singles pool
router.get('/get/singles/:tournament_id/:round_id/:pool_id', function(req, res) {
  const query = 'SELECT * FROM Singles_Games WHERE (tourny_id = ? AND round_id = ? AND pool_id = ?);';
  const filter = [parseInt(req.params.tournament_id), parseInt(req.params.round_id), parseInt(req.params.pool_id)];
  connection.query(query, filter, connection.handleRequest(res,'GET singles game'));
});

// GET games for a doubles pool
router.get('/get/doubles/:tournament_id/:round_id/:pool_id', function(req, res) {
  const query = 'SELECT * FROM Doubles_Games WHERE (tourny_id = ? AND round_id = ? AND pool_id = ?);';
  const filter = [parseInt(req.params.tournament_id), parseInt(req.params.round_id), parseInt(req.params.pool_id)];
  connection.query(query, filter, connection.handleRequest(res,'GET doubles game'));
});

// GET all played singles games
router.get('/get/singles', function(req, res) {
  const query = 'SELECT * FROM Singles_Games WHERE winner IS NOT NULL;';
  connection.query(query, connection.handleRequest(res,'GET all singles games'));
});

// GET all played doubles games
router.get('/get/doubles', function(req, res) {
  const query = 'SELECT * FROM Doubles_Games WHERE winner IS NOT NULL;';
  connection.query(query, connection.handleRequest(res,'GET all doubles games'));
});

// UPDATE Singles Game
router.patch('/singles/update/:game_id', function(req, res) {
  const game = req.body;
  const query = 'UPDATE Singles_Games SET winner = ?, loser = ?, validator = ?, coin_flip_winner = ?, differential = ? WHERE id = ?';
  const filter = [game.winner, game.loser, game.validator, game.coin_flip_winner, game.differential, req.params.game_id];
  connection.query(query, filter, connection.handleRequest(res,'PATCH singles games'));
});

// UPDATE Doubles Game
router.post('/doubles/update/:game_id', function(req, res) {
  const game = req.body;
  const query = 'UPDATE Doubles_Games SET winner = ?, loser = ?, validator = ?, coin_flip_winner = ?, differential = ? WHERE id = ?';
  const filter = [game.winner, game.loser, game.validator, game.coin_flip_winner, game.differential, req.params.game_id];
  connection.query(query, filter, connection.handleRequest(res,'PATCH doubles games'));
});

// GET games for a singles playoff
router.get('/get/singles/:playoff_id', function(req, res) {
  const query = 'SELECT * FROM Singles_Games WHERE (playoff = 1 AND playoff_id = ?);';
  const filter = [parseInt(req.params.playoff_id)];
  connection.query(query, filter, connection.handleRequest(res,'GET singles playoff games'));
});

// GET games for a doubles playoff
router.get('/get/doubles/:playoff_id', function(req, res) {
  const query = 'SELECT * FROM Doubles_Games WHERE (playoff = 1 AND playoff_id = ?);';
  const filter = [parseInt(req.params.playoff_id)];
  connection.query(query, filter, connection.handleRequest(res,'GET doubles playoff games'));
});

// GET won singles games for a player
router.get('/singles/wins/:player_id', function(req, res) {
  const query = 'SELECT * FROM Singles_Games WHERE (player1_id = ? OR player2_id = ?) AND winner = ?;';
  const filter = [parseInt(req.params.player_id), parseInt(req.params.player_id), parseInt(req.params.player_id)];
  connection.query(query, filter, connection.handleRequest(res,'GET singles wins'));
});

// GET won doubles games for a team
router.get('/doubles/wins/:team_id', function(req, res) {
  const query = 'SELECT * FROM Doubles_Games WHERE (team1_id = ? OR team2_id = ?) AND winner = ?;';
  const filter = [parseInt(req.params.team_id), parseInt(req.params.team_id), parseInt(req.params.team_id)];
  connection.query(query, filter, connection.handleRequest(res,'GET doubles wins'));
});


module.exports = router;
