const express = require('express');
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

// GET rounds for a singles tournament
router.get('/get/singles/:tournament_id', function(req, res) {
  const query = 'SELECT * FROM singles_rounds WHERE tournament_id = ?';
  const filter = [parseInt(req.params.tournament_id)];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// GET rounds for a doubles tournament
router.get('/get/doubles/:tournament_id', function(req, res) {
  const query = 'SELECT * FROM doubles_rounds WHERE tournament_id = ?';
  const filter = [parseInt(req.params.tournament_id)];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

module.exports = router;