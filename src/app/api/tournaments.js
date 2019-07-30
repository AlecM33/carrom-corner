const express = require('express');
const router = express.Router();

const connection = require('./db');

// POST singles tournament
router.post('/singles/post', function(req, res) {
  const tournament_info = req.body;
  const query = 'INSERT INTO Singles_Tournaments VALUES (NULL, ?, false, NULL, NULL, ?, 1, ?, false, true);';
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
  const query = 'INSERT INTO Doubles_Tournaments VALUES (NULL, ?, false, NULL, NULL, ?, 1, ?, false, true);';
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
  const query = 'SELECT * FROM Singles_Tournaments where active=true';
  connection.query(query, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// GET all doubles tournaments
router.get('/doubles/get', function(req, res) {
  const query = 'SELECT * FROM Doubles_Tournaments where active=true';
  connection.query(query, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// GET a specific singles tournament
router.get('/singles/get/:singles_id', function(req, res) {
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
router.get('/doubles/get/:doubles_id', function(req, res) {
  const query = 'SELECT * FROM Doubles_Tournaments WHERE id = ?';
  const filter = [parseInt(req.params.doubles_id)];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// UPDATE Singles Tournament winner
router.post('/singles/winner/:tourny_id', function(req, res) {
  const query = 'UPDATE Singles_Tournaments SET winner = ?, winner_name = ? WHERE id = ?';
  const filter = [req.body.winner, req.body.winner_name, req.params.tourny_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// UPDATE Doubles Tournament winner
router.post('/doubles/winner/:tourny_id', function(req, res) {
  const query = 'UPDATE Doubles_Tournaments SET winner = ?, winner_name = ? WHERE id = ?';
  const filter = [req.body.winner, req.body.winner_name, req.params.tourny_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// UPDATE Singles Tournament ended
router.post('/singles/ended/:tourny_id', function(req, res) {
  const query = 'UPDATE Singles_Tournaments SET ended = true WHERE id = ?';
  const filter = [req.params.tourny_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// UPDATE Doubles Tournament ended
router.post('/doubles/ended/:tourny_id', function(req, res) {
  const query = 'UPDATE Doubles_Tournaments SET ended = 1 WHERE id = ?';
  const filter = [req.params.tourny_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// UPDATE Singles Tournament Round
router.post('/singles/update_round/:tourny_id', function(req, res) {
  const query = 'UPDATE Singles_Tournaments SET current_round = ? WHERE id = ?';
  const filter = [req.body.current_round, req.params.tourny_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// UPDATE Doubles Tournament Round
router.post('/doubles/update_round/:tourny_id', function(req, res) {
  const query = 'UPDATE Doubles_Tournaments SET current_round = ? WHERE id = ?';
  const filter = [req.body.current_round, req.params.tourny_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// UPDATE singles tournament Playoff status
router.post('/singles/update_playoffs/:tourny_id', function(req, res) {
  const query = 'UPDATE Singles_Tournaments SET playoffs_started = true WHERE id = ?';
  const filter = [req.params.tourny_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

// UPDATE Doubles Tournament playoff status
router.post('/doubles/update_playoffs/:tourny_id', function(req, res) {
  const query = 'UPDATE Doubles_Tournaments SET playoffs_started = true WHERE id = ?';
  const filter = [req.params.tourny_id];
  connection.query(query, filter, function(err, result) {
    if (err) throw err;
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

router.delete('/singles/:tourny_id', function(req, res){
  const query = 'UPDATE Singles_Tournaments set active=false where id = ?';
  const filter = [req.params.tourny_id];
  connection.query(query, filter, function(err, result) {
    if (err) console.log(err);
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

router.delete('/doubles/:tourny_id', function(req,res){
  const query = 'UPDATE Doubles_Tournaments set active=false where id = ?';
  const filter = [req.params.tourny_id];
  debugQuery(query, filter);
  connection.query(query, filter, function(err, result) {
    if (err) console.log(err);
    else {
      return res.status(200).send(JSON.stringify(result));
    }
  })
});

debugQuery = (query, filter) => {
  let output = query;
  if(query.split('').filter((it)=>it==='?').length !== filter.length) return;
  for(let item of filter){
    output = output.replace('?',item);
  }
  console.log(output);
};

module.exports = router;
