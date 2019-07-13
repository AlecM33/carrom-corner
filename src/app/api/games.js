const express = require('express');
const path = require('path');
const mysql = require('mysql');
const router = express.Router();

const connection = require('./db');

// POST Singles game
router.post('/singles/post', function(req, res) {
  const game = req.body;
  const query = 'INSERT INTO Singles_Games VALUES (NULL, ?, ?, ?, false, ?, ?, NULL, NULL, NULL);';
  const filter = [game.tournamentId, game.roundId, game.poolId, game.player1Id, game.player2Id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// POST Doubles game
router.post('/doubles/post', function(req, res) {
  const game = req.body;
  const query = 'INSERT INTO Doubles_Games VALUES (NULL, ?, ?, ?, false, ?, ?, NULL, NULL, NULL);';
  const filter = [game.tournamentId, game.roundId, game.poolId, game.team1Id, game.team2Id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// GET games for a singles pool
router.get('/get/singles/:tournament_id/:round_id/:pool_id', function(req, res) {
  const query = 'SELECT * FROM Singles_Games WHERE (tourny_id = ? AND round_id = ? AND pool_id = ?);';
  const filter = [parseInt(req.params.tournament_id), parseInt(req.params.round_id), parseInt(req.params.pool_id)];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// GET games for a doubles pool
router.get('/get/doubles/:tournament_id/:round_id/:pool_id', function(req, res) {
  const query = 'SELECT * FROM Doubles_Games WHERE (tourny_id = ? AND round_id = ? AND pool_id = ?);';
  const filter = [parseInt(req.params.tournament_id), parseInt(req.params.round_id), parseInt(req.params.pool_id)];
  console.log(filter);
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// UPDATE Singles Game
router.post('/singles/update/:game_id', function(req, res) {
  const game = req.body;
  const query = 'UPDATE Singles_Games SET winner = ?, loser = ?, differential = ? WHERE id = ?';
  const filter = [game.winner, game.loser, game.differential, req.params.game_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// UPDATE Doubles Game
router.post('/doubles/update/:game_id', function(req, res) {
  const game = req.body;
  const query = 'UPDATE Doubles_Games SET winner = ?, loser = ?, differential = ? WHERE id = ?';
  const filter = [game.winner, game.loser, game.differential, req.params.game_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

module.exports = router;
