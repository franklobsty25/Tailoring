var express = require('express');
var Tailor = require('../models/tailor');
var tailor_auth = require('../tailor_auth');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var multer = require('multer');
var sharp = require('sharp');
const { promisify } = require('util');
var nodemailer = require('nodemailer');


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

/* GET all tailors. */
router.get('/', tailor_auth.authenticateToken, tailor_auth.verifyAdmin, (req, res, next) => {
  Tailor.find({}).then((tailors) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(tailors);

  },
  err => next(err))
  
  .catch((err) => next(err));

});
/* GET specific tailor */
router.get('/admin/:tailorId', tailor_auth.authenticateToken, tailor_auth.verifyAdmin, (req, res, next) => {
  Tailor.findById(req.params.tailorId).then((tailor) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(tailor);

  },
  err => next(err))
  
  .catch((err) => next(err));

});
/* GET specific tailor by user*/
router.get('/user/:tailorId', (req, res, next) => {
  Tailor.findById(req.params.tailorId).then((tailor) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(tailor);

  },
  err => next(err))
  
  .catch((err) => next(err));

});
/* GET tailor. */
router.get('/tailor', tailor_auth.authenticateToken, (req, res, next) => {
  Tailor.findById(req.tailor._id).then((tailor) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(tailor);

  },
  err => next(err))
  
  .catch((err) => next(err));

});
/* POST admin & tailor registeration */
router.post('/register', async (req, res, next) => {

  await bcrypt.genSalt(10, (err, salt) => {
    if (err)
    return next(err);

    bcrypt.hash(req.body.password, salt, (err, hash) => {
        if (err)
        return next(err); 

        req.body.password = hash;

        Tailor.create(req.body).then((tailor) => {

          var token = tailor_auth.getToken({_id: tailor._id});

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registeration successful.', admin: tailor.admin, access_token: token});
      
        },
        err => next(err))
        .catch((err) => next(err));

    });
    
  });
  
});
/* POST admin & tailor login */
router.post('/login', (req, res, next) => {

  Tailor.findOne({email: req.body.email}).then(async (tailor) => {
    
    if (tailor != null) {
      var validPassword = await bcrypt.compare(req.body.password, tailor.password);

      if (validPassword) {

        var token = tailor_auth.getToken({_id: tailor._id});

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, admin: tailor.admin, access_token: token});
      }
      else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, status: 'Invalid Password.'});
      }
    }
    else {
      err = new Error(req.params.email + ' does not exists.');
      res.statusCode = 404;
      res.json({success: false, status: err});
    }
  },
  err => next(err))
  .catch((err) => next(err));

});
// POST for password change
router.post('/changepassword', tailor_auth.authenticateToken, async (req, res, next) => {

  await bcrypt.genSalt(10, (err, salt) => {

    if (err)
    return next(err);

    bcrypt.hash(req.body.newPassword, salt, (err, hash) => {
      if (err)
      return next(err);

      Tailor.findById(req.tailor._id).then(async (tailor) => {

        if (tailor != null) {
          var valid = await bcrypt.compare(req.body.oldPassword, tailor.password);

          if (valid) {

            tailor.password = hash;
            tailor.save().then((tailor) => {
              
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({success: true});
            })

          }
          else {
            res.status(401).send('Current password invalid!');
          }

        }
        else {
          err = new Error()
          res.statusCode = 404;
          res.status(404).send('Sorry!, account does not exists.');
        }

      },
      err => next(err))

      .catch((err) => next(err));

    });

  });


});
/* POST user forgot password */
router.post('/forgotpassword', async (req, res, next) => {
  var token = (await promisify(crypto.randomBytes)(20)).toString('hex');
  
  Tailor.findOne({email: req.body.email}).then((tailor) => {
    
    if (!tailor) {
      res.status(403).send({success: false, status: 'No account with that email address exists.'});
    }

    var resetEmail = {
      to: tailor.email,
      from: 'info@tailoringhub.com',
      subject: 'Password Reset',
      message: `
      You are receiving this because you (or someone else) have requested the reset of the password for your account.
      Please click on the following link, or paste this into your browser to complete the process:
      http://localhost:3000/reset/${token}
      If you did not request this, please ignore this email and your password will remain unchanged.
      `,
    };

    var transporter = nodemailer.createTransport({
      service: 'tailoringhub',
      auth: {
        user: 'info@tailoringhub.com',
        pass: 'Tailoringhub25.!'
      }
    });

    transporter.sendMail(resetEmail, (err, info) => {
      if (err) {
        return next(err);
      }
      else {
        res.send({success: true, status: `An email has been sent to ${tailor.email} with furthur instructions.`, info: info});
      }
    });

  });
});
/* GET reset template */
router.get('/reset/:token', (req, res) => {
  res.redirect('https://www.tailoringhub.com/authentication/locked'); //check reset template from angular
});
/* POST reset password */
router.post('/reset', (req, res, next) => {
  Tailor.findOne({email: req.body.email}).then(async(tailor) => {

    if (!tailor)
    return next(err);

    await bcrypt.genSalt(10, (err, salt) => {
      if (err)
      return next(err); 

      bcrypt.hash(req.body.password, salt, (err, hash) => {
        if (err)
        return next(err); 

        tailor.password = hash;
        tailor.save((err, tailor) => {
          if (err)
          return next(err);
    
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Password reset successful.'});
    
          var resetEmail = {
            to: tailor.email,
            from: 'info@tailoringhub.com',
            subject: 'Your password has been changed',
            message: `This is a confirmation that the password for your account ${tailor.email} has just been changed.`
          }
    
          var transporter = nodemailer.createTransport({
            service: 'tailoringhub',
            auth: {
              user: 'info@tailoringhub.com',
              pass: 'Tailoringhub25.!'
            }
          });
    
          transporter.sendMail(resetEmail, (err, info) => {
            if (err)
            return next(err);
    
            res.send({success: true, status: 'Your password has been changed.', info: info});
    
            res.redirect('/'); // replace tailor url
          });
    
        })

    });

    });

  },
  err => next(err))

  .catch((err) => next(err));

});
/* PUT tailor changes */
router.put('/changedetail', tailor_auth.authenticateToken, (req, res, next) => {
  
  Tailor.findOneAndUpdate({_id: req.tailor._id}, {
      $set: req.body
  }, {new: true}).then((tailor) => {

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: 'Profile update successful.'});
  },
  err => next(err))

  .catch((err) => next(err));

});
/* POST tailor picture */
router.post('/profile-pic', tailor_auth.authenticateToken, upload.single('profile'), async (req, res, next) => {

  await sharp(req.file.buffer)
  .resize(500, 500)
  .jpeg({quality: 90})
  .toFile(
    `public/images/profile/${req.file.originalname}`
  );

  Tailor.findById(req.tailor._id).then((tailor) => {

    if (tailor != null) {

      tailor.photoUrl = req.file.originalname;
      tailor.save().then(() => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true});

      },
      err => next(err))
      .catch((err) => next(err));

    }
    else {
      res.status(403).send('Sorry!, account with that address does not exists.');
    }
  },
  err => next(err))

  .catch((err) => next(err));

});
/* DELETE user */
router.delete('/remove/:tailorId', tailor_auth.authenticateToken, tailor_auth.verifyAdmin, (req, res, next) => {
  Tailor.findByIdAndRemove(req.params.tailorId).then(() => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, status: 'Tailor information deleted successfully.'});

  },
  err => next(err))

  .catch((err) => next(err));

}); 
/* LOGOUT user */
router.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.clearCookie('session-id');
});
  

module.exports = router;