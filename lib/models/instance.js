require('colors');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var instanceSchema = new Schema({
    instanceName: { type: String, required: true, unique: true },
    instanceNum: { type: String },
    templateNum: { type: Number, required: true },
    templateName: { type: String },
    templateCPU: { type: String },
    templateRam: { type: String },
    details: {
        status: { type: String },
        interfaces: [{
            id: { type: String },
            ip: { type: String },
            mac: { type: String }
        }]
    },
});

var Instance = function() {
    this.InstanceDB = mongoose.model('Instance', instanceSchema);
};

Instance.prototype.insertInstance = function(params, res) {
    var self = this;
    // Recebendo os parâmetros da requisição
    var newVm = this.InstanceDB(params);

    newVm.save(function(err, result) {
        if (err) {
            //duplicate key
            if (err && err.code === 11000) {
                return res.json({
                    status: 'ERROR',
                    stdout: 'Instance already exists.'
                });
            } else {
                return res.json({
                    status: 'ERROR',
                    stdout: 'Error Createe Instance.'
                });

            }
        } else {
            return res.send({
                status: 'OK',
                stdout: 'Instance Created.'
            });
        }
    });
};

Instance.prototype.getallinstances = function(res) {
    this.InstanceDB.find({}, function(err, result) {
        if (err) {
            return res.json({
                status: "ERROR",
                stdout: "Error to load exists instances."
            });
        } else {
            return res.json({
                status: "OK",
                stdout: result
            });
        }
    });
};

Instance.prototype.getVmId = function(params, res, callback) {
    this.InstanceDB.findOne(params, function(err, result) {
        if (err) {
            return res.json({
                status: "ERROR",
                stdout: "Error to load exists instances."
            });
        } else {
            // console.log("instance", result);
            callback(result, res);
        }
    });
};

Instance.prototype.deleteInstance = function(params, res) {
    // console.log("Model instance deleteInstance.");
    this.InstanceDB.remove(params, function(err, result) {
        if (err) {
            return res.json({
                status: "ERROR",
                stdout: "Error to load exists instances."
            });
        } else {
            return res.json({
                status: "OK",
                stdout: "Instance success removed."
            });
        }
    });
};

Instance.prototype.updateInstance = function(id, newIns, res) {
    this.InstanceDB.update(id, { $set: newIns }, { upsert: false, multi: false }, function(err, result) {
        if (err) {
            return res.json({
                status: "ERROR",
                stdout: "Error to update instances."
            });
        } else {
            return res.json({
                status: "OK",
                stdout: "Instance success updated."
            });
        }
    })
};

Instance.prototype.updateDetails = function(id, docupdate, res) {
    this.InstanceDB.update({ _id: id }, { $set: { details: docupdate.details } }, function(err, result) {
        if (err) {
            console.log("Error", err.toString());
            return res.json({
                status: "ERROR",
                stdout: err.toString()
            });
        } else {
            return res.json({
                status: "OK",
                stdout: docupdate
            });
        }
    });
};

module.exports = Instance;