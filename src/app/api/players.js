const express = require('express');
const path = require('path');
const mysql = require('mysql');
const router = express.Router();

const connection = require('./db');

// POST player
router.post('/post', function(req, res) {
  const player_info = req.body;
  const query = 'INSERT INTO players VALUES (NULL, ?, ?, 1200, 1200, 0, 0, 0.0, 0, 0, 0);';
  const filter = [player_info.name, player_info.nickname];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// GET all players
router.get('/get', function(req, res) {
  const query = 'SELECT * FROM players';
  connection.query(query, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

//DELETE player
router.delete('/delete/:player_id', function(req, res) {
  const player_id = parseInt(req.params.player_id);
  const query = 'DELETE FROM players WHERE id = ?';
  const filter = [player_id]
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

module.exports = router;
