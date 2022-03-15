var express = require('express');
var authenticate = require('../authenticate');
var Top = require('../models/top');
var Down = require('../models/down');
var tailor_auth = require('../tailor_auth');


var router = express.Router();
router.use(express.json());


// GET all top measurements
router.get('/tops', (req, res, next) => {

    Top.find({}).populate('userId').then((tops) => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(tops);
    },
    err => next(err))

    .catch((err) => next(err));

});

// GET user top measurement
router.get('/top/user', authenticate.verifyUser, (req, res, next) => {

    Top.findOne({userId: req.user._id}).then((top) => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(top);
    },
    err => next(err))

    .catch((err) => next(err));
});

// GET user top measurement by tailor
router.get('/top/:userId', tailor_auth.authenticateToken, (req, res, next) => {

    Top.findOne({userId: req.params.userId}).then((top) => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(top);
    },
    err => next(err))

    .catch((err) => next(err));
});

// POST user top measurement
router.post('/savetop', authenticate.verifyUser, (req, res, next) => {
    req.body.userId = req.user._id;

    Top.create(req.body).then(() => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Shirt long/short sleeve measurement saved.'});

    },
    err => next(err))

    .catch((err) => next(err));
});

// CHANGE user top measurement
router.put('/topchanges', authenticate.verifyUser, (req, res, next) => {

    Top.findOneAndUpdate({userId: req.user._id}, {
        $set: req.body
    }, {new: true}).then(() => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Shirt long/short sleeve measurement saved.'});

    },
    err => next(err))

    .catch((err) => next(err));
});

// GET all down measurements
router.get('/downs', (req, res, next) => {

    Down.find({}).populate('userId').then((downs) => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(downs);
    },
    err => next(err))

    .catch((err) => next(err));

});

// GET user down measurement
router.get('/down/user', authenticate.verifyUser, (req, res, next) => {

    Down.findOne({userId: req.user._id}).then((down) => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(down);
    },
    err => next(err))

    .catch((err) => next(err));
});

// GET user down measurement by tailor
router.get('/down/:userId', tailor_auth.authenticateToken, (req, res, next) => {

    Down.findOne({userId: req.params.userId}).then((down) => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(down);
    },
    err => next(err))

    .catch((err) => next(err));
});

// POST user down measurement
router.post('/savedown', authenticate.verifyUser, (req, res, next) => {
    req.body.userId = req.user._id;

    Down.create(req.body).then(() => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Trouser/Shorts measurement saved.'});

    },
    err => next(err))

    .catch((err) => next(err));
});

// CHANGE user down measurement
router.put('/downchanges', authenticate.verifyUser, (req, res, next) => {

    Down.findOneAndUpdate({userId: req.user._id}, {
        $set: req.body
    }, {new: true}).then(() => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Trouser/Shorts measurement saved.'});

    },
    err => next(err))

    .catch((err) => next(err));
});



module.exports = router;