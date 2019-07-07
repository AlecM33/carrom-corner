const express = require('express');
const router = express.Router();

const connection = require('./db');

// POST singles pool
router.post('/singles/post', function(req, res) {
  const pool_info = req.body;
  const query = 'INSERT INTO singles_pools VALUES (NULL, ?, ?);';
  const filter = [pool_info.roundId, pool_info.number];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      console.log(JSON.stringify(result));
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// POST doubles pool
router.post('/doubles/post', function(req, res) {
  const pool_info = req.body;
  const query = 'INSERT INTO doubles_pools VALUES (NULL, ?, ?);';
  const filter = [pool_info.roundId, pool_info.number];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      console.log(JSON.stringify(result));
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// GET pools for a singles round
router.get('/get/singles/:round_id', function(req, res) {
  const query = 'SELECT * FROM singles_pools WHERE round_id = ?';
  const filter = [parseInt(req.params.round_id)];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// GET pools for a doubles round
router.get('/get/doubles/:round_id', function(req, res) {
  const query = 'SELECT * FROM doubles_pools WHERE round_id = ?';
  const filter = [parseInt(req.params.round_id)];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

module.exports = router;
