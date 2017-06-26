require('colors');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var optionInfoSchema = new Schema({
    "_id": { type: String, required: true, unique: true  },
    pageUrlInfo: { type: String },
    variables: { type: Array, "default": [] },
    directives: [{
        directive: { type: String },
        syntax: { type: String },
        default: { type: String },
        context: { type: String }
    }]
}, { "_id": false });

var OptionInfo = function() {
    this.OptionInfoDB = mongoose.model('OptionInfo', optionInfoSchema);
};

OptionInfo.prototype.getOptionSelectedInfo = function(parms, res) {
    this.OptionInfoDB.find({ "directives": { "$elemMatch": { "directive": parms } } }, { "pageUrlInfo": 1, "variables": 1, "directives.$": 1 }, function(err, info) {
        if (err) {
            res.json("err");
            return;
        }
        res.json(info);
    });
};


OptionInfo.prototype.InsertOptionInfo = function(params, res) {
    var self = this;
    // Recebendo os parâmetros da requisição
    var newOptInfo = this.OptionInfoDB(params);

    newOptInfo.save(function(err) {
        if (err) {
            return;
        }
        console.log('Option Info inserted!');
    });
};


module.exports = OptionInfo;
