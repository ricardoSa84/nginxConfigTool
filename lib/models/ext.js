// grab the things we need
require('colors');
var db = require('./connectDB.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var conn = db.connectDBMongo();

var extSchema = new Schema({
    text: { type: String, required: true, unique: true },
    ext: { type : Array , "default" : [] }
});

var Ext = function() {
    this.ExtDB = mongoose.model('Ext', extSchema);
};

Ext.prototype.getAllExt = function(req, res) {
    var self = this;
    this.ExtDB.find({}, function(err, ext) {
        if (err) {
            res.json("err");
            return;
        }
        res.json(ext);
    });
};

module.exports = Ext;