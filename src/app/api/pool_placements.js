const express = require('express');
const router = express.Router();

const connection = require('./db');

// POST singles pool placements
router.post('/singles/post', function(req, res) {
  let placements = [];
  for (let i = 0; i < Object.keys(req.body).length; i++) {
    placements[i] = [req.body[i].poolId, req.body[i].playerId]
  }
  console.log(placements);
  const query = 'INSERT INTO Singles_Pool_Placements (pool_id, player_id) VALUES ?;';
  connection.query(query, [placements], function(err, result) {
    if (err) throw err;
    else {
      console.log(JSON.stringify(result));
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// POST doubles pool placements
router.post('/doubles/post', function(req, res) {
  let placements = [];
  for (let i = 0; i < Object.keys(req.body).length; i++) {
    placements[i] = [req.body[i].poolId, req.body[i].teamId]
  }
  console.log(placements);
  const query = 'INSERT INTO Doubles_Pool_Placements (pool_id, team_id) VALUES ?;';
  connection.query(query, [placements], function(err, result) {
    if (err) throw err;
    else {
      console.log(JSON.stringify(result));
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// GET pool placements for a singles pool
router.get('/get/singles/:pool_id', function(req, res) {
  const query = 'SELECT * FROM Singles_Pool_Placements WHERE pool_id = ?';
  const filter = [parseInt(req.params.pool_id)];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// GET pool placements for a doubles pool
router.get('/get/doubles/:pool_id', function(req, res) {
  const query = 'SELECT * FROM Doubles_Pool_Placements WHERE pool_id = ?';
  const filter = [parseInt(req.params.pool_id)];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

module.exports = router;
