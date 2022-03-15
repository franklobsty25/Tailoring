var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Down = new Schema({
    length: {
        type: Number,
        require: true
    },
    waist: {
        type: Number,
        require: true
    },
    thighs: {
        type: Number,
        require: true
    },
    bass: {
        type: Number,
        require: true
    },
    seat: {
        type: Number,
        require: true
    },
    knee: {
        type: Number,
        require: true
    },
    flap: {
        type: Number,
        require: true
    },
    additionalNotes: {
        type: String,
        default: ''
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
}, {
    timestamp: true
});


module.exports = mongoose.model('DownMeasurement', Down);