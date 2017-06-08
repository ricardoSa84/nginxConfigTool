// grab the things we need
require('colors');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create a schema User
var userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    pass: { type: String, required: true }
});

// the schema is useless so far
// we need to create a model using it
var User = function() {
    this.UserDB = mongoose.model('User', userSchema);
};

User.prototype.loginUser = function(params, res, next) {
	var self = this;
    this.UserDB.findOne(params, function(err, user) {
        if (err) {
            res.json("err");
            return;
        }
        if (!user) {
            res.json("err");
            return;
        }
        // object of the user
        //console.log(user);
        res.json("userOk");
        next();
    });
};

User.prototype.InsertUser = function(params, res, next) {
	var self = this;
    // Recebendo os parâmetros da requisição
    // create a new user
    var newUser = this.UserDB(params);

    // save the user
    newUser.save(function(err) {
        if (err) {
            return;
        }
        console.log('User created!');
        if (next) {
        	res.json('ok');
        }        
    });
};

module.exports = User;