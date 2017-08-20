// grab the things we need
require('colors');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var extSchema = new Schema({
    text: { type: String, required: true, unique: true },
    type: { type: String },
    ext: { type: Array, "default": [] }
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
        res.json(ext.sort());
    });
};

Ext.prototype.getCountExt = function(callback) {
    this.ExtDB.count(function(err, opts) {
        if (err) {
            console.log("Error", err);
            return;
        }
        if (opts <= 0) {
            console.log("++++++++++++++++++++ Add Ext +++++++++++++++++++++++");
            callback();
        } else {
            console.log("----------------- Db Contains Ext ------------------");
        }
    });
};

Ext.prototype.InsertExt = function(params, res) {
    var self = this;
    // Recebendo os parâmetros da requisição
    var newExt = this.ExtDB(params);

    newExt.save(function(err) {
        if (err) {
            return;
        }
        console.log('Ext inserted!');
    });
};

Ext.prototype.InsertExtMulti = function(params) {
    var self = this;
    // Recebendo os parâmetros da requisição
    this.ExtDB.insertMany(params, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log('Ext inserted Multi!');
        }
    });
};


module.exports = Ext;