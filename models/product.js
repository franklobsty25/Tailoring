var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Review = new Schema({
    name: String,
    email: String,
    rating: Number,
    review: String,
    photoUrl: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

var Product = new Schema({
    name: String,
    image: String,
    images: [],
    fabric: String,
    color: String,
    category: String,
    discount: Number,
    description: String,
    quantity: Number,
    price: Number,
    total: Number,
    delivery: Number,
    reviews: [Review],
    duration: Number,
    xsmallSize: Number,
    smallSize: Number,
    mediumSize: Number,
    largeSize: Number,
    xlargeSize: Number,
    xxlargeSize: Number,
    termCondition: Boolean,
    tailorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tailor'
    }
},{
    timestamps: true
});


module.exports = mongoose.model('Product', Product);