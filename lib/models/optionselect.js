require('colors');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var optionSchema = new Schema({
    directive: { type: String, required: true },
    context: { type: String, required: true }
});

var OptionSelect = function() {
    this.OptionDB = mongoose.model('OptionSelect', optionSchema);
};

OptionSelect.prototype.getOptionsFromPlace = function(params, res) {
    var self = this;
    this.OptionDB.find(params, function(err, opts) {
        if (err) {
            res.json("err");
            return;
        }
        var valopts = removeDuplicates(opts, "directive")
        res.json(valopts);
    });
};

OptionSelect.prototype.getCountOpt = function(callback) {
    var self = this;
    this.OptionDB.count(function(err, opts) {
        if (err) {
            console.log("Error", err);
            return;
        }
        if (opts <= 0) {
            console.log("+++++++++++++++++++ Add Options ++++++++++++++++++++");
            callback();
        } else {
            console.log("--------------- Db Contains Options ---------------- ");
        }
    });
};

OptionSelect.prototype.InsertOptionSelect = function(params, res) {
    var self = this;
    // Recebendo os parâmetros da requisição
    var newOptions = this.OptionDB({
        _id: params.directive,
        directive: params.directive,
        context: params.context
    });

    newOptions.save(function(err) {
        if (err) {
            return;
        }
        console.log('OptionSelect inserted!');
    });
};

OptionSelect.prototype.InsertOptionSelectMulti = function(params) {
    var self = this;
    // Recebendo os parâmetros da requisição
    this.OptionDB.insertMany(params, function(err, result) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('OptionSelectMany inserted!' /*, result*/ );
    });
};

module.exports = OptionSelect;

function removeDuplicates(originalArray, prop) {
    var newArray = [];
    var lookupObject = {};

    for (var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for (i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
    return newArray;
}