var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Message = new Schema({
    name: String,
    email: String,
    phoneNumber: String,
    subject: String,
    message: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', Message);