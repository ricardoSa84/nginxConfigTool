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

    if (upstream.editMode == "true") {
        this.upstreamDB.update({ _id: upstream._id }, upstream, { upsert: true, setDefaultsOnInsert: true }, function(err, result) {
            if (err) {
                return res.json({
                    status: "Upstream Error",
                    stdout: err.toString()
                });
            } else {
                console.log('Upstream inserted!', result);
                utils.processReceivedJsonUpstream(upstream, result, res);
            }
        });
    } else {

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
                utils.processReceivedJsonUpstream(upstream, result, res);
            }
        });
    }
};

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

Upstream.prototype.removeUpstream = function(upstream, res) {
    this.upstreamDB.remove({ _id: upstream }, function(err, result) {
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
        try {
            fs.unlinkSync("/etc/nginx/conf.d/0000-" + upstream.split("-")[1] + "-upstreams.conf");
        } catch (e) {
            console.log("Error", e.toString());
        }
    });
};

module.exports = Upstream;