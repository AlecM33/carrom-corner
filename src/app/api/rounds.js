const express = require('express');
const router = express.Router();

const connection = require('./db');

// POST singles round
router.post('/singles/post', function(req, res) {
  const round_info = req.body;
  const query = 'INSERT INTO Singles_Rounds VALUES (NULL, ?, ?, ?);';
  const filter = [round_info.size, round_info.number, round_info.tournamentId];
  connection.query(query, filter, connection.handleRequest(res,'POST singles round'));
});

// POST doubles round
router.post('/doubles/post', function(req, res) {
  const round_info = req.body;
  const query = 'INSERT INTO Doubles_Rounds VALUES (NULL, ?, ?, ?);';
  const filter = [round_info.size, round_info.number, round_info.tournamentId];
  connection.query(query, filter, connection.handleRequest(res,'POST doubles round'));
});

// GET rounds for a singles tournament
router.get('/get/singles/:tournament_id', function(req, res) {
  const query = 'SELECT * FROM Singles_Rounds WHERE tournament_id = ?';
  const filter = [parseInt(req.params.tournament_id)];
  connection.query(query, filter, connection.handleRequest(res,'GET all singles tournament rounds'));
})

// GET round for a singles tournament
router.get('/get/singles/:tournament_id/:round_number', function(req, res) {
  const query = 'SELECT * FROM Singles_Rounds WHERE (tourny_id = ? AND number = ?)';
  const filter = [parseInt(req.params.tournament_id), parseInt(req.params.round_number)];
  connection.query(query, filter, connection.handleRequest(res,'GET singles tournament round'));
});

// GET round for a doubles tournament
router.get('/get/doubles/:tournament_id/:round_number', function(req, res) {
  const query = 'SELECT * FROM Doubles_Rounds WHERE (tourny_id = ? AND number = ?)';
  const filter = [parseInt(req.params.tournament_id), parseInt(req.params.round_number)];
  connection.query(query, filter, connection.handleRequest(res,'GET doubles tournament round'));
});

module.exports = router;
