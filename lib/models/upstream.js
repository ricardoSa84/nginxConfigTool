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
            self.updateSingleUpstream(upstream, "local", res);
        } else {
            self.insertSingleUpstream(upstream, "local", res);
        }
    } else {
        Instance.getVmId({ _id: instanceid }, res, function(result, res) {
            var ipInstance = '192.168.1.119'; //result.details.interfaces[0].ip; // 

            // if (result.details.status !== 'running') {
            //     return res.json({
            //         status: "ERROR",
            //         stdout: "This Instance not Running."
            //     });
            // } else {
                if (upstream.editMode == "true") {
                    self.updateSingleUpstream(upstream, "remote", res);
                } else {
                    self.insertSingleUpstream(upstream, "remote", res);
                }
            // }
        });
    }
};

Upstream.prototype.insertSingleUpstream = function(upstream, local, res) {
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
            utils.processReceivedJsonUpstream(upstream, result, local, res);
        }
    });
}

Upstream.prototype.updateSingleUpstream = function(upstream, local, res) {
    this.upstreamDB.update({ _id: upstream._id }, upstream, { upsert: true, setDefaultsOnInsert: true }, function(err, result) {
        if (err) {
            return res.json({
                status: "Upstream Error",
                stdout: err.toString()
            });
        } else {
            console.log('Upstream inserted!', result);
            utils.processReceivedJsonUpstream(upstream, result, local, res);
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
    Instance.getVmId({ _id: upstream[0] }, res, function(result, res) {
        // console.log(result);
        var ipInstance = '192.168.1.119'; //result.details.interfaces[0].ip;
        if (upstream[0] === "localhost") {
            self.upstreamDB.remove({ _id: upstreams }, function(err, result2) {
                if (err) {
                    return res.json({
                        status: "ERROR",
                        stdout: err.toString()
                    });
                }
                // console.log(result2);
                fs.unlinkSync("/etc/nginx/conf.d/0000-" + upstream[1] + "-upstreams.conf");
            });
        } else {
            // if (result.details.status !== 'running') {
            //     return res.json({
            //         status: "ERROR",
            //         stdout: "This Instance not Running."
            //     });
            // } else {
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
            // }
        }
    });
};

module.exports = Upstream;