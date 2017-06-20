require('colors');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var optionSchema = new Schema({
    directive: { type: String, required: true},
    context: { type: String, required: true }
});

var OptionSelect = function() {
    this.OptionDB = mongoose.model('OptionSelect', optionSchema);
};

OptionSelect.prototype.getOptionsFromPlace = function(params, res){
	var self = this;
    this.OptionDB.find(params, function(err, opts) {
        if (err) {
            res.json("err");
            return;
        }
        res.json(opts);
    });
}

OptionSelect.prototype.InsertOptionSelect = function(params, res) {
    var self = this;
    // Recebendo os parâmetros da requisição
    var newOptions = this.OptionDB(params);

    newOptions.save(function(err) {
        if (err) {
            return;
        }
        console.log('OptionSelect inserted!');
    });
};


module.exports = OptionSelect;
