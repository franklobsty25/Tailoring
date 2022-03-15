require('dotenv').config();


module.exports = {
    'secretKey': process.env.TOKEN_SECRET,
    'mongoUrl': process.env.MONGO_URL,
    'facebook': {
        clientId: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET
    },
    'twitter': {
        consumerKey: process.env.TWITTER_ID,
        consumerSecret: process.env.TWITTER_SECRET
    },
    'google': {
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET
    }
}