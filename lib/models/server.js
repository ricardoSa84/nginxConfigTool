require('colors');
var fs = require("fs");
var mongoose = require('mongoose');
var utils = require("./../utils");
var Schema = mongoose.Schema;

var optionsSchema = new Schema({
    optname: { type: String },
    valid: { type: String },
    select: { type: String },
    text: { type: String }
});


var serverSchema = new Schema({
    "_id": { type: String, required: true, unique: true },
    instanceserver: { type: String, required: true },
    servername: { type: String, required: true },
    port: { type: String, required: true },
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
            initLocPath: { type: String },
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

ServerHost.prototype.removeServerHost = function(params, nextInsert, res) {
    var self = this;
    var keyDelFile = params._id;
    this.serverHostDB.remove({ "_id": params._id }, function(err, srv) {
        if (err) {
            res.json({
                status: "Server delete Error",
                stdout: err
            });
            console.log(err);
        } else {
            if (nextInsert) {
                self.InsertServerHost(params, res);
            } else {
                res.json({
                    status: "Server deleted",
                    stdout: "Ok"
                });
                fs.unlinkSync("/etc/nginx/conf.d/1000-" + keyDelFile + ".conf");
                console.log("Server deleted");
            }
        }
    });
};

ServerHost.prototype.InsertServerHost = function(params, res) {
    var self = this;
    // Recebendo os parâmetros da requisição
    var newServer = this.serverHostDB(params);

    this.serverHostDB.find({ "_id": newServer._id }, function(err, srv) {
        if (err) {
            res.json({
                status: "Server Error",
                stdout: err
            });
            console.log(err);
        } else if (srv.length > 0) {
            res.json({
                status: "Server Exists",
                stdout: "Erro"
            });
        } else {
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
                    utils.processReceivedJson(params);
                    console.log('Server inserted!');
                }
            });
        }
    });
};

ServerHost.prototype.getAllServers = function(req, res) {
    var self = this;
    this.serverHostDB.find({}, { "_id": 1 }, function(err, servers) {
        if (err) {
            res.json({
                status: "servers error",
                stdout: err
            });
        } else {
            res.json({
                status: "servers Ok",
                stdout: servers
            });
        }
    }).sort({ "_id": 1 });
};

ServerHost.prototype.getserverid = function(params, res) {
    this.serverHostDB.find({ "_id": params }, function(err, server) {
        if (err) {
            res.json({
                status: "servers error",
                stdout: err
            });
        } else {
            res.json({
                status: "server Ok",
                stdout: server
            });
        }
    });
};

module.exports = ServerHost;
