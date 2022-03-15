var jwt = require('jsonwebtoken');
var config = require('./config');
const { deleteOne } = require('./models/tailor');
const tailor = require('./models/tailor');
var Tailor = require('./models/tailor');


exports.getToken = (tailor) => {
    return jwt.sign(tailor, config.secretKey, {expiresIn: 7200});
};


exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null)
    return res.sendStatus(401);

    jwt.verify(token, config.secretKey, (err, tailor) => {

        if (err)
        return res.sendStatus(403);

        req.tailor = tailor;

        next();
    })
}



/* Admin or Tailor verification */
exports.verifyAdmin = (req, res, next) => {
    Tailor.findById(req.tailor._id).then((tailor) => {

        if (tailor.admin) {
            next();
        } else {
            err = new Error("You are not authorized to perform this operation!");
            err.status = 401;
            next(err);
        }
    }, err => next(err))

    .catch((err) => next(err));

};


/* Admin or Tailor dashboard login verification  */
exports.verifyDashboard = (req, res) => {
    Tailor.findById(req.tailor._id).then((tailor) => {

        if (tailor.admin) {
            res.redirect('admin dashboard');
        } else {
            res.redirect('tailor dashboard');
        }

    }, err => next(err))
    
    .catch((err) => next(err));

};