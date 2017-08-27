require('colors');
var fs = require("fs"),
    mongoose = require('mongoose'),
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

var upstreamSchema = new Schema({
    "_id": { type: String, required: true, unique: true },
    instanceid: { type: String, required: true },
    name: { type: String },
    options: [optionsSchema]
}, { "_id": false });

var Upstream = function() {
    this.upstreamDB = mongoose.model('Upstream', upstreamSchema);
};

Upstream.prototype.insertUpstream = function(upstream, res) {
    var self = this;
    // console.log(upstream.editMode);
    var instanceid = upstream._id.split('-')[0];

    if (instanceid === "localhost") {
        if (upstream.editMode == "true") {
            self.updateSingleUpstream(null, upstream, "local", res);
        } else {
            self.insertSingleUpstream(null, upstream, "local", res);
        }
    } else {
        Instance.getVmId({ _id: instanceid }, res, function(result, res) {
            var ipInstance = result.details.interfaces[0].ip; //'192.168.1.119'; // 

            if (result.details.status !== 'running') {
                return res.json({
                    status: "ERROR",
                    stdout: "This Instance not Running."
                });
            } else {
                if (upstream.editMode == "true") {
                    self.updateSingleUpstream(ipInstance, upstream, "remote", res);
                } else {
                    self.insertSingleUpstream(ipInstance, upstream, "remote", res);
                }
            }
        });
    }
};

Upstream.prototype.insertSingleUpstream = function(ip, upstream, local, res) {
    var newups = this.upstreamDB(upstream);
    newups.save(function(err, result) {
        if (err) {
            //duplicate key
            if (err && err.code === 11000) {
                return res.json({
                    status: "Upstream Exists",
                    stdout: err.toString()
                });
            } else {
                return res.json({
                    status: "Upstream Error",
                    stdout: err.toString()
                });
            }
        } else {
            console.log('Upstream inserted!');
            utils.processReceivedJsonUpstream(ip, upstream, result, local, res);
        }
    });
}

Upstream.prototype.updateSingleUpstream = function(ip, upstream, local, res) {
    this.upstreamDB.update({ _id: upstream._id }, upstream, { upsert: true, setDefaultsOnInsert: true }, function(err, result) {
        if (err) {
            return res.json({
                status: "Upstream Error",
                stdout: err.toString()
            });
        } else {
            console.log('Upstream inserted!', result);
            utils.processReceivedJsonUpstream(ip, upstream, result, local, res);
        }
    });
}

Upstream.prototype.getUpstremInstance = function(params, res) {
    this.upstreamDB.find({ instanceid: params }, function(err, result) {
        if (err) {
            return res.json({
                status: "ERROR",
                stdout: err.toString()
            });
        }
        // console.log(result);
        res.json({
            status: "OK",
            stdout: result
        });
    });
};

Upstream.prototype.getUpstream = function(params, res) {
    this.upstreamDB.find({ _id: params }, function(err, result) {
        if (err) {
            return res.json({
                status: "ERROR",
                stdout: err.toString()
            });
        }
        // console.log(result);
        res.json({
            status: "OK",
            stdout: result
        });
    })
}

Upstream.prototype.removeUpstream = function(upstreams, res) {
    var self = this;
    var upstream = upstreams.split("-");
    console.log(upstream);

    if (upstream[0] === "localhost") {
        self.upstreamDB.remove({ _id: upstreams }, function(err, result2) {
            if (err) {
                return res.json({
                    status: "ERROR",
                    stdout: err.toString()
                });
            }
            // console.log(result2);
            try {
                fs.unlinkSync("/etc/nginx/conf.d/0000-" + upstream[1] + "-upstreams.conf");
                return res.json({
                    status: "OK",
                    stdout: "This upstream removed."
                });
            } catch (e) {
                console.log("ERROR", e.toString());
            }
        });
    } else {
        Instance.getVmId({ _id: upstream[0] }, res, function(result, res) {
            // console.log(result);
            var ipInstance = result.details.interfaces[0].ip; //'192.168.1.119'; //

            if (result.details.status !== 'running') {
                return res.json({
                    status: "ERROR",
                    stdout: "This Instance not Running."
                });
            } else {
                self.upstreamDB.remove({ _id: upstreams }, function(err, result) {
                    if (err) {
                        return res.json({
                            status: "ERROR",
                            stdout: err.toString()
                        });
                    }
                    // console.log(result);
                    utils.removeFiles(ipInstance, "/etc/nginx/conf.d/0000-" + upstream[1] + "-upstreams.conf", res);
                });
            }
        });
    }
};

module.exports = Upstream;