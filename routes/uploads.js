var express = require('express');
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

router.get('/', (req, res, next) => {
	res.statusCode = 403;
	res.end('GET operation not supported on /imageUpload');
});


router.post('/upload', upload.array('designs', 5), async (req, res, next) => {
    if (!req.files)
    return next(err);

    const images = []

    await Promise.all(
        req.files.map(async file => {
            await sharp(file.buffer)
            .resize(750, 500)
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(
                `public/images/${file.originalname}`
            );
            images.push(file.originalname);

        })
        
    );
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(images);

});


router.put('/', tailor_auth.authenticateToken, tailor_auth.verifyAdmin, (req, res, next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /imageUpload');
});


router.delete('/', tailor_auth.authenticateToken, tailor_auth.verifyAdmin, (req, res, next) => {
	res.statusCode = 403;
	res.end('DELETE operation not supported on /imageUpload');
});



module.exports = router;