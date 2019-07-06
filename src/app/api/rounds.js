const express = require('express');
const path = require('path');
const mysql = require('mysql');
const router = express.Router();

const connection = require('./db');

// POST singles round
router.post('/singles/post', function(req, res) {
  const round_info = req.body;
  const query = 'INSERT INTO singles_rounds VALUES (NULL, ?, ?, ?);';
  const filter = [round_info.size, round_info.number, round_info.tournamentId];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// POST doubles round
router.post('/doubles/post', function(req, res) {
  const round_info = req.body;
  const query = 'INSERT INTO doubles_rounds VALUES (NULL, ?, ?, ?);';
  const filter = [round_info.size, round_info.number, round_info.tournamentId];
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

module.exports = router;
