const express = require('express');
const path = require('path');
const mysql = require('mysql');
const router = express.Router();

const connection = require('./db');

// POST singles tournament
router.post('/singles/post', function(req, res) {
  const tournament_info = req.body;
  const query = 'INSERT INTO Singles_Tournaments VALUES (NULL, ?, false, NULL, ?, 1, ?);';
  const filter = [tournament_info.name, tournament_info.size, tournament_info.rounds];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// POST doubles tournament
router.post('/doubles/post', function(req, res) {
  const tournament_info = req.body;
  const query = 'INSERT INTO Doubles_Tournaments VALUES (NULL, ?, false, NULL, NULL, ?, 1, ?);';
  const filter = [tournament_info.name, tournament_info.size, tournament_info.rounds];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  });
});

// GET all singles tournaments
router.get('/singles/get', function(req, res) {
  const query = 'SELECT * FROM Singles_Tournaments';
  connection.query(query, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// GET all doubles tournaments
router.get('/doubles/get', function(req, res) {
  const query = 'SELECT * FROM Doubles_Tournaments';
  connection.query(query, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// GET a specific singles tournament
router.get('/get/:singles_id', function(req, res) {
  const query = 'SELECT * FROM Singles_Tournaments WHERE id = ?';
  const filter = [parseInt(req.params.singles_id)];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// GET a specific doubles tournament
router.get('/get/:doubles_id', function(req, res) {
  const query = 'SELECT * FROM Doubles_Tournaments WHERE id = ?';
  const filter = [parseInt(req.params.doubles_id)];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

//DELETE player
router.delete('/delete/:player_id', function(req, res) {
  const player_id = parseInt(req.params.player_id);
  const query = 'DELETE FROM Players WHERE id = ?';
  const filter = [player_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

module.exports = router;
