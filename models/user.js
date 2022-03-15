var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    firstName: String,
    lastName: String,
    provider: String,
    photoUrl: {
        type: String,
        default: ''
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    townCity: {
        type: String,
        default: ''
    },
    state: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    postalCodeZip: {
        type: String,
        default: ''
    },
    differentAddress: {
        type: String,
        default: ''
    },
    orderNote: {
        type: String,
        default: ''
    },
    deliveryDate: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);