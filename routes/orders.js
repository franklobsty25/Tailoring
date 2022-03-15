var express = require('express');
var Order = require('../models/order');
var authenticate = require('../authenticate');
var tailor_auth = require('../tailor_auth');


var router = express.Router();
router.use(express.json());

/* GET orders listing. */
router.get('/', tailor_auth.authenticateToken, tailor_auth.verifyAdmin, (req, res, next) => {
  Order.find({}).then((orders) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(orders);

  },
  err => next(err))

  .catch((err) => next(err));

});



/* GET tailor orders */
router.get('/tailor', tailor_auth.authenticateToken, (req, res, next) => {

    Order.find({tailorId: req.tailor._id}).then((orders) => {
  
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(orders);
  
    },
    err => next(err))
  
    .catch((err) => next(err));
  
  });



/* POST order */
router.post('/order', authenticate.verifyUser, (req, res, next) => {
    req.body.userId = req.user._id;

    Order.create(req.body).then(() => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Order created successfully.'});

    },
    err => next(err))

    .catch((err) => next(err));

});



// PUT complete order
router.put('/complete/:orderId', tailor_auth.authenticateToken, (req, res, next) => {

  Order.findByIdAndUpdate(req.params.orderId, {
      $set: req.body
  }, {new: true}).then(() => {

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: 'Order completed successfully.'});

  },
  err => next(err))

  .catch((err) => next(err));
});




// PUT complete settlement
router.put('/settlement/:orderId', tailor_auth.authenticateToken, tailor_auth.verifyAdmin, (req, res, next) => {

  Order.findByIdAndUpdate(req.params.orderId, {
      $set: req.body
  }, {new: true}).then(() => {

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: 'Tailor settlement completed successfully.'});

  },
  err => next(err))

  .catch((err) => next(err));
});




/* DELETE order */
router.delete('/remove/:orderId', tailor_auth.authenticateToken, tailor_auth.verifyAdmin,  (req, res, next) => {
    Order.findByIdAndRemove(req.params.orderId).then((order) => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Order deleted successfully.'});

    },
    err => next(err))

    .catch((err) => next(err));

});






module.exports = router;