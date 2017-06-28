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


module.exports = Ext;
