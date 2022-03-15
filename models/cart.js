var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Cart = new Schema({
    name: String,
    image: String,
    fabric: String,
    category: String,
    quantity: Number,
    price: Number,
    total: Number,
    delivery: Number,
    duration: Number,
    xsmallSize: Number,
    smallSize: Number,
    mediumSize: Number,
    largeSize: Number,
    xlargeSize: Number,
    xxlargeSize: Number,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    tailorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tailor'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', Cart);