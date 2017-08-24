require('colors');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var optionInfoSchema = new Schema({
    pageUrlInfo: { type: String },
    variables: { type: Array, "default": [] },
    directives: [{
        directive: { type: String },
        syntax: { type: String },
        default: { type: String },
        context: { type: String }
    }]
});

var OptionInfo = function() {
    this.OptionInfoDB = mongoose.model('OptionInfo', optionInfoSchema);
};

OptionInfo.prototype.getOptionSelectedInfo = function(req, res) {
    this.OptionInfoDB.find({ "directives": { "$elemMatch": { "directive": req.params.info, "context" : new RegExp(req.params.context, "i") } } }, { "pageUrlInfo": 1, "variables": 1, "directives.$": 1 }, function(err, info) {
        if (err) {
            return res.json({
                status: "ERROR",
                stdout: err.toStrig()
            });
        }
        // console.log(info);
        res.json({
            status: "OK",
            stdout: info
        });
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

OptionInfo.prototype.InsertOptionInfoMulti = function(params) {
    var self = this;
    this.OptionInfoDB.insertMany(params, function(err, result) {
        if (err) {
            console.log("Error", err);
            return;
        }
        console.log('Option InfoMulti inserted!' /*, result*/ );
    });
};

module.exports = OptionInfo;