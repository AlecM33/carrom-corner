const express = require('express');
const router = express.Router();

const connection = require('./db');

// POST singles playoff
router.post('/singles/post', function(req, res) {
  const playoff_info = req.body;
  const query = 'INSERT INTO Singles_Playoffs VALUES (NULL, ?, NULL, false);';
  const filter = [playoff_info.tourny_id];
  connection.query(query, filter, connection.handleRequest(res,'POST singles playoff'));
});

// POST doubles playoff
router.post('/doubles/post', function(req, res) {
  const playoff_info = req.body;
  const query = 'INSERT INTO Doubles_Playoffs VALUES (NULL, ?, NULL, NULL, false);';
  const filter = [playoff_info.tourny_id];
  connection.query(query, filter, connection.handleRequest(res,'POST doubles playoff'));
});

// GET a singles playoff
router.get('/singles/get/:tourny_id', function(req, res) {
  const query = 'SELECT * FROM Singles_Playoffs WHERE tourny_id = ?';
  const filter = [req.params.tourny_id];
  connection.query(query, filter, connection.handleRequest(res,'GET singles playoff'));
});

// GET a doubles playoff
router.get('/doubles/get/:tourny_id', function(req, res) {
  const query = 'SELECT * FROM Doubles_Playoffs WHERE tourny_id = ?';
  const filter = [req.params.tourny_id];
  connection.query(query, filter, connection.handleRequest(res,'GET doubles playoff'));
});


// UPDATE Singles playoff
router.post('/singles/update/:tourny_id', function(req, res) {
  const playoff = req.body;
  const query = 'UPDATE Singles_Playoffs SET winner = ?, ended = ? WHERE id = ?';
  const filter = [playoff.winner, playoff.ended, req.params.tourny_id];
  connection.query(query, filter, connection.handleRequest(res,'PATCH singles playoff'));
});


// UPDATE Doubles playoff
router.post('/doubles/update/:tourny_id', function(req, res) {
  const playoff = req.body;
  const query = 'UPDATE Doubles_Playoffs SET winner = ?, ended = ? WHERE id = ?';
  const filter = [playoff.winner, playoff.ended, req.params.tourny_id];
  connection.query(query, filter, connection.handleRequest(res,'POST singles playoff'));
});

module.exports = router;
