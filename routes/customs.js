var express = require('express');
var Custom = require('../models/custom');
var authenticate = require('../authenticate');
var tailor_auth = require('../tailor_auth');
var multer = require('multer');
var sharp = require('sharp');
var path = require('path');

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


// GET all custom designs
router.get('/', tailor_auth.authenticateToken, tailor_auth.verifyAdmin, (req, res, next) => {

    Custom.find({}).then((customs) => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(customs);

    }, err => next(err))

    .catch((err) => next(err));

});

// GET download image
router.get('/download/:image', (req, res, next) => {

    let fileName = req.params.image;
    let filePath = path.join('public/images/custom', fileName);

    res.download(filePath, fileName);
    
});

// GET specific custom
router.get('/:customId', tailor_auth.authenticateToken, tailor_auth.verifyAdmin, (req, res, next) => {

    Custom.findById(req.params.customId).then((custom) => {
    
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(custom);
    
    }, err => next(err))
    
    .catch((err) => next(err));
    
});

// POST custom
router.post('/custom', authenticate.verifyUser, (req, res, next) => {
    req.body.userId = req.user._id;

    Custom.create(req.body).then(() => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Your design will be reviewed and cost will be sent via email and sms within'});
    },
    err => next(err))
    
    .catch((err) => next(err));

});

// upload custom design
router.post('/upload', authenticate.verifyUser, upload.single('custom'), async (req, res, next) => {
    if (!req.file)
    return next(err);

        await sharp(req.file.buffer)
        .resize(1024, 640)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(
            `public/images/custom/${req.file.originalname}`
        );
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, status: 'Upload successful.'});

});



module.exports = router;