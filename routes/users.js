var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var authenticate = require('../authenticate');
var tailor_auth = require('../tailor_auth');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var multer = require('multer');
var sharp = require('sharp');
const { promisify } = require('util');
const { session } = require('passport');
/*const redis = require('redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const redisClient = redis.createClient({
  enable_offline_queue: true,
});*/

/*const maxWrongAttemptsByIPperDay =  100;
const maxConsecutiveFailsByUsernameAndIP = 10;

const limiterSlowBruteByIP = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'login_fail_ip_per_day',
  points: maxWrongAttemptsByIPperDay,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
});

const limiterConsecutiveFailsByUsernameAndIP = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'login_fail_consecutive_username_and_ip',
  points: maxConsecutiveFailsByUsernameAndIP,
  duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
  blockDuration: 60 * 60, // Block for 1 hour
});

const getUsernameIPkey = (username, ip) => `${username}_${ip}`;*/


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


/* GET users listing. */
router.get('/admin/:userId', tailor_auth.authenticateToken, tailor_auth.verifyAdmin, function(req, res, next) {
  User.findById(req.params.userId).then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(user);
  },
  err => next(err))

  .catch((err) => next(err));

});


/* GET user logged in */
router.get('/user', authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user._id).then((user) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(user);

  },
  err => next(err))

  .catch((err) => next(err));

});


/* POST user */
router.post('/register', (req, res, next) => {
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      if (req.body.firstName)
        user.firstName = req.body.firstName;
      if (req.body.lastName)
      user.lastName = req.body.lastName;
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return;
        }

        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'applicaton/json');
          res.json({success: true, status: 'Registration successful...'});
        });

      });
    }
  });

});


/* LOGIN user */
router.post('/login', async (req, res, next) => {
const ipAddr = req.ip;
const usernameIPkey = getUsernameIPkey(req.body.username, ipAddr);

const [resUsernameAndIP, resSlowByIP] = await Promise.all([
  limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
  limiterSlowBruteByIP.get(ipAddr),
]);

let retrySecs = 0;

// Check if IP or Username + IP is already blocked
if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay) {
  retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
} else if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > maxConsecutiveFailsByUsernameAndIP) {
  retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
}

if (retrySecs > 0) {
  res.set('Retry-After', String(retrySecs));
  res.status(429).send('Too Many Requests');
} else {
  passport.authenticate('local', async (err, user, info) => {
    if (err)
    return next(err);

    if (!user) {
      res.status(404).send({success: false, status: 'Account does not exists!', err: info});
      // Consume 1 point from limiters on wrong attempt and block if limits reached
      try {
        const promises = [limiterSlowBruteByIP.consume(ipAddr)];
        if (user.exists) {
          // Count failed attempts by Username + IP only for registered users
          promises.push(limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey));
        }

        await Promise.all(promises);

        res.status(400).end('Email or Password is wrong.');
      } catch (rlRejected) {
        if (rlRejected instanceof Error) {
          throw rlRejected
        } else {
          res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
          res.status(429).send('Too Many Requests');
        }
      }
    }
    req.login(user, {session:false}, async (err) => {
      if (err) {
        res.status(401).send({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});
      }
      if (user) {
        if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > 0) {
          // Reset on successful authorisation
          await limiterConsecutiveFailsByUsernameAndIP.delete(usernameIPkey);
        }

        var token = authenticate.getToken({_id: req.user._id});
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Login Successful!', access_token: token});

      }
    });

  }) (req, res, next);
}

});

// POST for password change
router.post('/changepassword', authenticate.verifyUser, (req, res, next) => {

    User.findById(req.user._id).then((user) => {

      user.changePassword(req.body.oldPassword, req.body.newPassword, (err, user) => {

        if (err) {
          res.status(401).send({err: '<strong>Sorry!</strong>&nbsp;&nbsp;Password not found!'});
          return false;
        }
        else {
          res.status(200).send({success: true, status: 'Password change successful.'});
        }
      });

    }, (err) => next(err))
    .catch((err) => next(err));
  
});

/* PUT user changes */
router.put('/change/profile', authenticate.verifyUser, (req, res, next) => {
  
  User.findByIdAndUpdate(req.user._id, {
    $set: req.body
  }, {new: true}).then(() => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, status: 'Profile update successful.'});

  },
  err => next(err))

  .catch((err) => next(err));

});

/* POST user forgot password */
router.post('/forgotpassword', async (req, res, next) => {
  var token = (await promisify(crypto.randomBytes)(20)).toString('hex');
  
  User.findOne({username: req.body.email}).then((user) => {
    
    if (!user) {
      res.status(404).send({err: 'No account with that email address exists.'});
    }

    var resetEmail = {
      to: user.username,
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
      host: '143.244.170.119',
      service: 'tailoringhub.com',
      port: 587,
      secure: false,
      auth: {
        user: 'tailoringhub.com',
        pass: 'Tailoringhub25.!'
      }
    });

    transporter.sendMail(resetEmail, (err, info) => {
      if (err) {
        return next(err);
      }
      else {
        res.status(200).send({success: true, status: `An email has been sent to ${user.username} with furthur instructions.`, info: info});
      }
    });

  });
});

/* GET reset template */
router.get('/reset/:token', (req, res) => {
  res.redirect('https://www.tailoringhub.com/reset-password'); //check reset template from angular
});

/* POST reset password */
router.post('/reset', (req, res, next) => {
  User.findOne({username: req.body.email}).then((user) => {

    if (!user)
    return next(err);

    User.register({username: user.username}, req.body.password).then((user) => {

      user.save((err, user) => {
        if (err)
        return next(err);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Password reset successfull.'});

        var resetEmail = {
          to: user.username,
          from: 'info@tailoringhub.com',
          subject: 'Your password has been changed',
          message: `This is a confirmation that the password for your account ${user.username} has just been changed.`
        }

        var transporter = nodemailer.createTransport({
          host: '143.244.170.119',
          service: 'tailoringhub.com',
          port: 587,
          secure: false,
          auth: {
            user: 'info@tailoringhub.com',
            pass: 'Tailoringhub25.!'
          }
        });

        transporter.sendMail(resetEmail, (err, info) => {
          if (err)
          return next(err);

          res.status(200).send({success: true, status: 'Your password has been changed.', info: info});

          res.redirect('/');
        });

      })

    },
    err => next(err))
    .catch((err) => next(err));

  },
  err => next(err))
  .catch((err) => next(err));

});

/* POST for image upload */
router.post('/profile-pic', authenticate.verifyUser, upload.single('image'), async (req, res, next) => {

  await sharp(req.file.buffer)
  .resize(500, 500)
  .jpeg({quality: 90})
  .toFile(
    `public/images/profile/${req.file.originalname}`
  );

  User.findById(req.user._id).then((user) => {

    if (user != null) {
      user.photoUrl = req.file.originalname;
      user.save().then(() => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Profile image upload successful.'});

      }, err => next(err))
      .catch((err) => next(err));

    }
    else {
      err = new Error('No account of that address exists.');
      err.status = 403;
      return next(err);
    }
  },
  err => next(err))

  .catch((err) => next(err));

});

/* DELETE user */
router.delete('/remove/:userId', tailor_auth.authenticateToken, tailor_auth.verifyAdmin, (req, res, next) => {
  User.findByIdAndRemove(req.params.userId).then(() => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, status: 'User information deleted successful.'});

  },
  err => next(err))

  .catch((err) => next(err));

});


/***************************************************************** SOCIAL NETWORK login ***************************************************************/
router.post('/social/login', (req, res, next) => {
User.findOne({username: req.body.username}).then((user) => {

  if (user != null) {
    var token = authenticate.getToken({_id: user._id});

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, access_token: token});
  }
  else {

    User.create(req.body).then((user) => {

      var token = authenticate.getToken({_id: user._id});
  
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, access_token: token, user: user});
  
    },
    err => next(err))
    .catch((err) => next(err));

  }
},
err => next(err))
.catch((err) => next(err));

});



/* LOGOUT user */
router.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.clearCookie('session_id');
  res.redirect('/');
});



module.exports = router;
