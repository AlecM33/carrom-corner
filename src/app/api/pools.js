const express = require('express');
const router = express.Router();

const connection = require('./db');

// POST singles pool
router.post('/singles/post', function(req, res) {
  const pool_info = req.body;
  const query = 'INSERT INTO Singles_Pools VALUES (NULL, ?, ?);';
  const filter = [pool_info.roundId, pool_info.number];
  connection.query(query, filter, connection.handleRequest(res,'POST singles pool'));
});

// POST doubles pool
router.post('/doubles/post', function(req, res) {
  const pool_info = req.body;
  const query = 'INSERT INTO Doubles_Pools VALUES (NULL, ?, ?);';
  const filter = [pool_info.roundId, pool_info.number];
  connection.query(query, filter, connection.handleRequest(res,'POST doubles pool'));
});

// GET pools for a singles round
router.get('/get/singles/:round_id', function(req, res) {
  const query = 'SELECT * FROM Singles_Pools WHERE round_id = ?';
  const filter = [parseInt(req.params.round_id)];
  connection.query(query, filter, connection.handleRequest(res,'GET singles pools'));
});

// GET pools for a doubles round
router.get('/get/doubles/:round_id', function(req, res) {
  const query = 'SELECT * FROM Doubles_Pools WHERE round_id = ?';
  const filter = [parseInt(req.params.round_id)];
  connection.query(query, filter, connection.handleRequest(res,'GET doubles pools'));
});

module.exports = router;
