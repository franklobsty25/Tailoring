var express = require('express');
var Cart = require('../models/cart');
var authenticate = require('../authenticate');


var router = express.Router();
router.use(express.json());

/* GET carts listing. */
router.get('/', function(req, res, next) {
  Cart.find({}).then((carts) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(carts);

  },
  err => next(err))

  .catch((err) => next(err));
});

/* GET user carts */
router.get('/cart', authenticate.verifyUser, function(req, res, next) {
    Cart.find({userId: req.user._id}).then((carts) => {
  
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(carts);
  
    },
    err => next(err))
  
    .catch((err) => next(err));
  });

/* POST cart */
router.post('/cart', authenticate.verifyUser, (req, res, next) => {
    req.body.userId = req.user._id;

    Cart.create(req.body).then(() => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Added to Cart'});

    },
    err => next(err))

    .catch((err) => next(err));
});

/* PUT user cart changes */
router.put('/change/:cartId', authenticate.verifyUser, (req, res, next) => {
    Cart.findByIdAndUpdate(req.params.cartId, {
        $set: req.body
    }, {new: true})
    .then(() => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Quantity update successful.'});

    },
    err => next(err))

    .catch((err) => next(err));
});

/* DELETE user cart */
router.delete('/remove/:cartId', authenticate.verifyUser, (req, res, next) => {
    Cart.findByIdAndRemove(req.params.cartId).then(() => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Product deleted from cart.'});

    },
    err => next(err))

    .catch((err) => next(err));
});

/* DELETE user carts */
router.delete('/remove', authenticate.verifyUser, (req, res, next) => {
  Cart.remove({}).then(() => {

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: 'Carts cleared.'});

  },
  err => next(err))

  .catch((err) => next(err));
});



module.exports = router;