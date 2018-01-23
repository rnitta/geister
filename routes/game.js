var express = require('express');
var router = express.Router();

router.get('/random', function(req, res, next) {
  res.render('random', { title: 'Random' });
});
router.get('/room', function(req, res, next) {
  res.render('index', { title: 'Geister-Mock' });
});


module.exports = router;
