require('colors');
var fs = require("fs"),
    mongoose = require('mongoose'),
    utils = require("./../utils"),
    Instance = require('./instance.js'),
    utils = require("./../utils"),
    Schema = mongoose.Schema;

Instance = new Instance();

var optionsSchema = new Schema({
    optname: { type: String },
    valid: { type: String },
    select: { type: String },
    text: { type: String }
});


var serverSchema = new Schema({
    "_id": { type: String, required: true, unique: true },
    instanceid: { type: String, required: true },
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
        options: [optionsSchema]
    }]
}, { "_id": false });

var ServerHost = function() {
    this.serverHostDB = mongoose.model('ServerHost', serverSchema);
};

ServerHost.prototype.removeServerHost = function(params, nextInsert, res) {
    var self = this;
    var paramsKey = params._id.split("-");
    if (paramsKey[0] === "localhost") {
        self.removeServerHostSimple(null, params, nextInsert, "local", res);
    } else {
        Instance.getVmId({ _id: paramsKey[0] }, res, function(result, res) {
            var ipInstance = result.details.interfaces[0].ip; // '192.168.1.119'; //

            if (result.details.status !== 'running') {
                return res.json({
                    status: "ERROR",
                    stdout: "This Instance not Running."
                });
            } else {
                self.removeServerHostSimple(ipInstance, params, nextInsert, "remote", res);
            }
        });
    }
};

ServerHost.prototype.removeServerHostSimple = function(ipInstance, params, nextInsert, local, res) {
    var self = this;
    var keyDelFile = params._id;
    self.serverHostDB.remove({ "_id": params._id }, function(err, srv) {
        if (err) {
            console.log(err.toString());
            return res.json({
                status: "ERROR",
                stdout: err.toString()
            });
        } else {
            console.log(srv);
            if (nextInsert) {
                self.InsertServerHost(params, res);
            } else {
                try {
                    var spl = keyDelFile.split("-");
                    if (spl[0] === "localhost") {
                        console.log("Server Deleted.");
                        fs.unlinkSync("/etc/nginx/conf.d/1000-" + spl[1] + "-" + spl[2] + ".conf");
                        return res.json({
                            status: "OK",
                            stdout: "Server Deleted."
                        });
                    } else {
                        console.log("Instance Remote Server deleted");
                        utils.removeFiles(ipInstance, "/etc/nginx/conf.d/1000-" + spl[1] + "-" + spl[2] + ".conf", res);
                    }
                } catch (e) {
                    console.log("ERROR", e.toString());
                }
            }
        }
    });
};

ServerHost.prototype.InsertServerHost = function(params, res) {
    var self = this;
    if (params.instanceid === "localhost") {
        self.InsertServerHostSimple(null, params, "local", res);
    } else {
        Instance.getVmId({ _id: params.instanceid }, res, function(result, res) {
            var ipInstance = result.details.interfaces[0].ip; // '192.168.1.119'; //

            if (result.details.status !== 'running') {
                return res.json({
                    status: "ERROR",
                    stdout: "This Instance not Running."
                });
            } else {
                self.InsertServerHostSimple(ipInstance, params, "remote", res);
            }
        });
    }
};

ServerHost.prototype.InsertServerHostSimple = function(ipInstance, params, local, res) {
    var self = this;
    // Recebendo os parâmetros da requisição
    var newServer = this.serverHostDB(params);
    // console.log(newServer);
    newServer.save(function(err, result) {
        if (err) {
            //duplicate key
            if (err && err.code === 11000) {
                return res.json({
                    status: "Server Exists",
                    stdout: "Erro"
                });
            } else {
                return res.json({
                    status: "ERROR",
                    stdout: err
                });
            }
        } else {
            console.log('Instance Server inserted!');
            utils.processReceivedJson(ipInstance, params, result, local, res);
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

ServerHost.prototype.getServerFromInstance = function(params, res) {
    var self = this;
    this.serverHostDB.find({ instanceid: params }, function(err, servers) {
        if (err) {
            return res.json({
                status: "ERROR",
                stdout: err.toString()
            });
        } else {
            return res.json({
                status: "OK",
                stdout: servers
            });
        }
    });
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