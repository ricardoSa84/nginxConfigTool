require('colors');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var optionsSchema =  new Schema({
	optname: { type: String },
	valid: { type: String },
	select: { type: String },
	text: { type: String }
});


var serverSchema = new Schema({
	"_id": { type: String, required: true, unique: true  },
	servername: { type: String, required: true},
	port: { type: String, required: true},
	serveropts: [optionsSchema],
	defaultLocation: {
		path: { type: String },
		proxy: { type: String },
		options: [optionsSchema]
	},
	locations: [{
		locValid: { type: String },
		locname: { type: String },
		locationPath: { type: String },
		staicCacheExtentions: {
			locpath: { type: String },
			timecache: { type: String }
		},
		staicCachePath: {
			initLocPath:{ type: String },
			locpath: { type: String },
			timecache: { type: String }
		},
		upstreams: {
			name: { type: String },
			options: [optionsSchema]
		},
		options: [optionsSchema]
	}]
}, { "_id": false });

var ServerHost = function() {
	this.serverHostDB = mongoose.model('ServerHost', serverSchema);
};

ServerHost.prototype.InsertServerHost = function(params, res) {
	var self = this;
    // Recebendo os parâmetros da requisição
    var newServer = this.serverHostDB(params);
console.log(params);
    newServer.save(function(err) {
    	if (err) {
    		res.json({
    			status: "Server Error",
    			stdout: err
    		});
    		console.log(err);
    	} else {
    		res.json({
    			status: "Server Created",
    			stdout: "OK"
    		});
    		console.log('Server inserted!');    		
    	}
    });
};


module.exports = ServerHost;