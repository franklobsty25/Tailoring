var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Top = new Schema({
    length: {
        type: Number,
        default: true
    },
    back: {
        type: Number,
        require: true
    },
    sleeve: {
        type: Number,
        require: true
    },
    chest: {
        type: Number,
        require: true
    },
    aroundArm: {
        type: Number,
        require: true
    },
    cuff: {
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
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('TopMeasurement', Top);