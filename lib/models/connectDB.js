require('colors');
var mongoose = require('mongoose');

// connect to mongo db
// this.connStr = self.config.dataBaseType + '://' + self.config.host + '/' + self.config.dbname;
var connStr = 'mongodb://localhost/NginsTool';
var conn = mongoose.connect(connStr, function(err) {
    if (err) {
        throw err;
    }
    console.log("Successfully connected to MongoDB".italic.magenta);
});

module.exports.connectDBMongo = function(){
	return conn;
};
