const express = require('express');
const router = express.Router();

const connection = require('./db');

// POST singles bracket
router.post('/singles/post', function(req, res) {
  const bracket_info = req.body;
  const query = 'INSERT INTO Singles_Brackets VALUES (NULL, ?, ?, ?);';
  const filter = [bracket_info.playoff_id, bracket_info.size, bracket_info.depth];
  connection.query(query, filter, connection.handleRequest(res,'POST singles bracket OK'));
});

// POST doubles bracket
router.post('/doubles/post', function(req, res) {
  const bracket_info = req.body;
  const query = 'INSERT INTO Doubles_Brackets VALUES (NULL, ?, ?, ?);';
  const filter = [bracket_info.playoff_id, bracket_info.size, bracket_info.depth];
  connection.query(query, filter, connection.handleRequest(res,'POST doubles bracket OK'));
});

// GET a singles bracket
router.get('/singles/get/:playoff_id', function(req, res) {
  const query = 'SELECT * FROM Singles_Brackets WHERE playoff_id = ?';
  const filter = [req.params.playoff_id];
  connection.query(query, filter, connection.handleRequest(res,'GET singles bracket OK'));
});

// GET a doubles bracket
router.get('/doubles/get/:playoff_id', function(req, res) {
  const query = 'SELECT * FROM Doubles_Brackets WHERE playoff_id = ?';
  const filter = [req.params.playoff_id];
  connection.query(query, filter, connection.handleRequest(res,'GET doubles bracket OK'));
});

// POST singles bracket node
router.post('/singles/nodes/post', function(req, res) {
  const node = req.body;
  const query = 'INSERT INTO Singles_Bracket_Nodes VALUES (NULL, ?, ?, ?, ?, ?, ?);';
  const filter = [node.bracket_id, node.player1_id, node.player2_id, node.seed1, node.seed2, node.node_index];
  connection.query(query, filter, connection.handleRequest(res,'GET singles node'));
});

// POST a doubles bracket node
router.post('/doubles/nodes/post', function(req, res) {
  const node = req.body;
  const query = 'INSERT INTO Doubles_Bracket_Nodes VALUES (NULL, ?, ?, ?, ?, ?, ?);';
  const filter = [node.bracket_id, node.team1_id, node.team2_id, node.seed1, node.seed2, node.node_index];
  connection.query(query, filter, connection.handleRequest(res,'GET doubles node'));
});

// UPDATE Singles node
router.patch('/singles/nodes/update/:node_id', function(req, res) {
  const node = req.body;
  const query = 'UPDATE Singles_Bracket_Nodes SET player1_id = ?, player2_id = ?, seed1 = ?, seed2 = ? WHERE id = ?';
  const filter = [node.player1_id, node.player2_id, node.seed1, node.seed2, req.params.node_id];
  connection.query(query, filter, connection.handleRequest(res,'POST singles node'));
});

// UPDATE Doubles node
router.patch('/doubles/nodes/update/:node_id', function(req, res) {
  const node = req.body;
  const query = 'UPDATE Doubles_Bracket_Nodes SET team1_id = ?, team2_id = ?, seed1 = ?, seed2 = ? WHERE id = ?';
  const filter = [node.team1_id, node.team2_id, node.seed1, node.seed2, req.params.node_id];
  connection.query(query, filter, connection.handleRequest(res,'PATCH doubles nodes'));
});

// GET singles bracket nodes for a playoff
router.get('/singles/nodes/get/:playoff_id', function(req, res) {
  const query = 'SELECT * FROM Singles_Bracket_Nodes WHERE bracket_id = ?';
  const filter = [req.params.playoff_id];
  connection.query(query, filter, connection.handleRequest(res,'GET singles nodes'));
});

// GET doubles bracket nodes for a playoff
router.get('/doubles/nodes/get/:playoff_id', function(req, res) {
  const query = 'SELECT * FROM Doubles_Bracket_Nodes WHERE bracket_id = ?';
  const filter = [req.params.playoff_id];
  connection.query(query, filter, connection.handleRequest(res,'GET doubles nodes'));
});

module.exports = router;
