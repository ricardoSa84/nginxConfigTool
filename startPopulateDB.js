require('colors');
var mongoose = require('mongoose'),
    dbconn = require('./lib/models/connectDB.js'),
    config = require('./config.js'),
    dbPopulate = require("./lib/populateDb.js");

var startPopulateDB = function() {
    dbPopulate.addDefaultUser();
    dbPopulate.InsertAllExt(null, null);
    dbPopulate.checkOptionsInserted(null, function(){
    	mongoose.connection.close();
    	console.log("-----------------------  Populate DB Complete -----------------------");
    });    
};

new startPopulateDB();

module.exports = startPopulateDB;