var express = require('express');
var Message = require('../models/message');
var tailor_auth = require('../tailor_auth');


var router = express.Router();
router.use(express.json());

/* GET messages listing. */
router.get('/', tailor_auth.authenticateToken, tailor_auth.verifyAdmin, (req, res, next) => {
  Message.find({}).then((messages) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(messages);

  },
  err => next(err))

  .catch((err) => next(err));

});

// POST customer message
router.post('/message', (req, res, next) => {
    Message.create(req.body).then(() => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Message sent to tailoringhub.'});
    },
    err => next(err))

    .catch((err) => next(err));
});



module.exports = router;