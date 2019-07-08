const express = require('express');
const path = require('path');
const mysql = require('mysql');
const router = express.Router();

const connection = require('./db');

// POST Singles game
router.post('/singles/post', function(req, res) {
  const game = req.body;
  const query = 'INSERT INTO Singles_Games VALUES (NULL, ?, ?, ?, false, ?, ?, NULL, NULL);';
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
  const query = 'INSERT INTO Doubles_Games VALUES (NULL, ?, ?, ?, false, ?, ?, NULL, NULL);';
  const filter = [game.tournamentId, game.roundId, game.poolId, game.team1Id, game.team2Id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

module.exports = router;
