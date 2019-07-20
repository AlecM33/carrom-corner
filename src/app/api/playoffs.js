const express = require('express');
const router = express.Router();

const connection = require('./db');

// POST singles playoff
router.post('/singles/post', function(req, res) {
  const playoff_info = req.body;
  const query = 'INSERT INTO Singles_Playoffs VALUES (NULL, ?, NULL, false);';
  const filter = [playoff_info.tourny_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// POST doubles playoff
router.post('/doubles/post', function(req, res) {
  const playoff_info = req.body;
  const query = 'INSERT INTO Doubles_Playoffs VALUES (NULL, ?, NULL, NULL, false);';
  const filter = [playoff_info.tourny_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  });
});

// GET a singles playoff
router.get('/singles/get/:tourny_id', function(req, res) {
  const query = 'SELECT * FROM Singles_Playoffs WHERE tourny_id = ?';
  const filter = [req.params.tourny_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  });
});

// GET a doubles playoff
router.get('/singles/get/:tourny_id', function(req, res) {
  const query = 'SELECT * FROM Doubles_Playoffs WHERE tourny_id = ?';
  const filter = [req.params.tourny_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  });
});


// UPDATE Singles playoff
router.post('/singles/update/:tourny_id', function(req, res) {
  const playoff = req.body;
  const query = 'UPDATE Singles_Playoffs SET winner = ?, ended = ? WHERE id = ?';
  const filter = [playoff.winner, playoff.ended, req.params.tourny_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});


// UPDATE Doubles playoff
router.post('/singles/update/:tourny_id', function(req, res) {
  const playoff = req.body;
  const query = 'UPDATE Doubles_Playoffs SET winner = ?, ended = ? WHERE id = ?';
  const filter = [playoff.winner, playoff.ended, req.params.tourny_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

module.exports = router;
