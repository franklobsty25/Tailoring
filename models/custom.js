var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Custom = new Schema({
    name: String,
    image: String,
    fabric: String,
    quantity: Number,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Custom', Custom);