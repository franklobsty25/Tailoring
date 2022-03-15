var passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var jwt = require('jsonwebtoken');
var config = require('./config');

exports.local = passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(function(user, done) {
    done(null, user._id);
});
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});

/* JWT generation */
exports.getToken = (user) => {
    return jwt.sign(user, config.secretKey, {expiresIn: 7200});
};

/* JWT user authentication */
exports.verifyUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null)
    return res.sendStatus(401);

    jwt.verify(token, config.secretKey, (err, user) => {

        if (err)
        return res.sendStatus(403);

        req.user = user;

        next();
    })
}

