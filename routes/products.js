var express = require('express');
var Product = require('../models/product');
var authenticate = require('../authenticate');
var tailor_auth = require('../tailor_auth');
var multer = require('multer');
var sharp = require('sharp');

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        return cb(new Error('You can upload only image files.'), false);
    }
    cb(null, true);
};

var upload = multer({storage: storage, fileFilter: imageFileFilter});


var router = express.Router();
router.use(express.json());


/* GET products. */
router.get('/', (req, res, next) => {
  Product.find({}).then((products) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(products);

  },
  err => next(err))
  .catch((err) => next(err));

});

/* GET product. */
router.get('/:productId', (req, res, next) => {
  Product.findById(req.params.productId).then((product) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(product);

  },
  err => next(err))
  .catch((err) => next(err));

});

/* POST product */
router.post('/product', tailor_auth.authenticateToken, (req, res, next) => {
  req.body.tailorId = req.tailor._id;

  Product.create(req.body).then(() => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, status: 'Design information save successful.'});

  },
  err => next(err))

  .catch((err) => next(err));

});

// upload designs
router.post('/upload', tailor_auth.authenticateToken, upload.array('designs', 5), async (req, res, next) => {

  if (!req.files)
  return next();

  await Promise.all(
    req.files.map(async file => {
        await sharp(file.buffer)
        .resize(750, 500)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(
            `public/images/design/${file.originalname}`
        );
        res.send({success: true, status: 'Information save successful.'});
    })
  );
});

/* POST product review */
router.post('/:productId/review', authenticate.verifyUser, (req, res, next) => {
  Product.findById(req.params.productId).then((product) => {

    if (product != null) {
      req.body.userId = req.user._id;
      product.reviews.push(req.body);
      product.save().then(() => {

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Review save successful.'});

      });
    }
    else {
      err = new Error('Product ' + req.params.productId + ' not found.');
      err.statusCode = 404;
      return next(err);
    }
  },
  err => next(err))

  .catch((err) => next(err));
});

/* PUT for changes or update */
router.put('/:productId', tailor_auth.authenticateToken, (req, res, next) => {
  Product.findByIdAndUpdate(req.params.productId, {
    $set: req.body
  }, {new: true}).then((product) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(product);

  },
  err => next(err))

  .catch((err) => next(err));

});

/* PUT chosen price & total by user */
router.put('/user/:productId', authenticate.verifyUser, (req, res, next) => {
  Product.findByIdAndUpdate(req.params.productId, {
    $set: req.body
  }, {new: true}).then(() => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true});

  },
  err => next(err))

  .catch((err) => next(err));
});

/* DELETE product */
router.delete('/:productId', tailor_auth.verifyAdmin, (req, res, next) => {
  Product.findByIdAndDelete(req.params.productId).then((product) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(product);

  },
  err => next(err))

  .catch((err) => next(err));

});


module.exports = router;