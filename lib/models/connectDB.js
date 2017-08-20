require('colors');
var mongoose = require('mongoose'),
    config = require('./../../config.js');
mongoose.Promise = global.Promise;

// connect to mongo db
var conn = mongoose.connect(config.mongodb, function(err) {
    if (err) {
        throw err;
    }
    console.log("Successfully connected to MongoDB".italic.magenta);
});

module.exports.connectDBMongo = function() {
    return conn;
};