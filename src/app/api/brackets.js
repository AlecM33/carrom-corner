const express = require('express');
const router = express.Router();

const connection = require('./db');

// POST singles bracket
router.post('/singles/post', function(req, res) {
  const bracket_info = req.body;
  const query = 'INSERT INTO Singles_Brackets VALUES (NULL, ?, ?, ?);';
  const filter = [bracket_info.playoff_id, bracket_info.size, bracket_info.depth];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// POST doubles bracket
router.post('/doubles/post', function(req, res) {
  const bracket_info = req.body;
  const query = 'INSERT INTO Doubles_Brackets VALUES (NULL, ?, ?, ?);';
  const filter = [bracket_info.playoff_id, bracket_info.size, bracket_info.depth];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  });
});

// GET a singles bracket
router.get('/singles/get/:playoff_id', function(req, res) {
  const query = 'SELECT * FROM Singles_Brackets WHERE playoff_id = ?';
  const filter = [req.params.playoff_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  });
});

// GET a doubles bracket
router.get('/doubles/get/:playoff_id', function(req, res) {
  const query = 'SELECT * FROM Doubles_Brackets WHERE playoff_id = ?';
  const filter = [req.params.playoff_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  });
});

// POST singles bracket node
router.post('/singles/nodes/post', function(req, res) {
  const node = req.body;
  const query = 'INSERT INTO Singles_Bracket_Nodes VALUES (NULL, ?, ?, ?, ?, ?, ?);';
  const filter = [node.bracket_id, node.player1_id, node.player2_id, node.seed1, node.seed2, node.node_index];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// POST a doubles bracket node
router.post('/doubles/nodes/post', function(req, res) {
  const node = req.body;
  const query = 'INSERT INTO Doubles_Bracket_Nodes VALUES (NULL, ?, ?, ?, ?, ?, ?);';
  const filter = [node.bracket_id, node.team1_id, node.team2_id, node.seed1, node.seed2, node.node_index];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// UPDATE Singles node
router.post('/singles/update/:node_id', function(req, res) {
  const node = req.body;
  const query = 'UPDATE Singles_Bracket_Nodes SET player1_id = ?, player2_id = ?, seed1 = ?, seed2 = ? WHERE id = ?';
  const filter = [node.player1_id, node.player2_id, node.seed1, node.seed2, req.params.node_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// UPDATE Doubles node
router.post('/doubles/update/:node_id', function(req, res) {
  const node = req.body;
  const query = 'UPDATE Doubles_Bracket_Nodes SET team1_id = ?, team2_id = ?, seed1 = ?, seed2 = ? WHERE id = ?';
  const filter = [node.team1_id, node.team2_id, node.seed1, node.seed2, req.params.node_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// GET singles bracket nodes for a playoff
router.get('/singles/nodes/get/:playoff_id', function(req, res) {
  const query = 'SELECT * FROM Singles_Bracket_Nodes WHERE bracket_id = ?';
  const filter = [req.params.playoff_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  });
});

// GET doubles bracket nodes for a playoff
router.get('/doubles/nodes/get/:playoff_id', function(req, res) {
  const query = 'SELECT * FROM Doubles_Bracket_Nodes WHERE bracket_id = ?';
  const filter = [req.params.playoff_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  });
});

module.exports = router;
