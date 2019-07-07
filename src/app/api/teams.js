const express = require('express');
const path = require('path');
const mysql = require('mysql');
const router = express.Router();

const connection = require('./db');

// POST team
router.post('/post', function(req, res) {
  const team = req.body;
  const query = 'INSERT INTO Teams VALUES (NULL, ?, ?, ?);';
  const filter = [team.tournamentId, team.player1Id, team.player2Id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// GET all Teams for a tournament
router.get('/get/:tournament_id', function(req, res) {
  const tournyid = req.params.tournament_id;
  const query = 'SELECT * FROM Teams WHERE tournamentId = ?';
  const filter = [tournyid];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

module.exports = router;
