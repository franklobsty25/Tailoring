var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var Tailor = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: String,
    lastName: String,
    phoneNumber: String,
    location: String,
    company: String,
    bank: {
        type: String,
        default: ''
    },
    accountNumber: {
        type: String,
        default: ''
    },
    accountBranch: {
        type: String,
        default: ''
    },
    settlementType: {
        type: String,
        default: ''
    },
    photoUrl: {
        type: String,
        default: ''
    },
    about: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});




module.exports = mongoose.model('Tailor', Tailor);