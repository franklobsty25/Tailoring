var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Order = new Schema({
    name: String,
    image: String,
    fabric: String,
    category: String,
    quantity: Number,
    price: Number,
    total: Number,
    orderDate: String,
    deliveryDate: String,
    settlement: {
        type: Boolean,
        default: false
    },
    settlementDate: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'Pending'
    },
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

module.exports = mongoose.model('Order', Order);