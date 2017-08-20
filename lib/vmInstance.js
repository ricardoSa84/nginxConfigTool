var OpenNebula = require('opennebula'),
    fs = require('fs'),
    Instance = require('./models/instance.js'),
    config = require('./../config.js'),
    one = new OpenNebula(config.openNebulaparams.one.auth, config.openNebulaparams.one.host);

Instance = new Instance();

module.exports.templateList = function(req, res) {
    one.getTemplates(function(err, templates) {
        if (err) {
            console.log(err);
            return res.status(500).json({
                'error': 'Error fetching template list.'
            });
        }

        var output = [];
        for (var i = 0; i < templates.length; i++) {
            if (templates[i] !== undefined) {
                output.push({
                    'id': templates[i].ID,
                    'name': templates[i].NAME
                });
            }
        }
        return res.status(200).json({
            'templates': output
        });
    }, -2);
};

module.exports.createInstance = function(req, res) {
    // console.log(req.body.data);
    var data = req.body.data;

    var template = one.getTemplate(parseInt(data.templateNum));
    var vmParams = 'MEMORY="' + ((data.templateRam * 1024) || 1024) +
        '"\nCPU="' + (data.templateCPU || 0.1) +
        '"\nVCPU="' + 1 +
        '"\n CONTEXT=[NETWORK="YES", NETWORK_UNAME="' + config.openNebulaparams.one.network + '" ' +
        'SSH_PUBLIC_KEY="' + config.sshKeyUser + '"]\n';

    template.instantiate(data.instanceName, undefined, vmParams, function(err, vm) {
        // console.log(err, vm);
        if (err) {
            console.log('Error Instance Created.');
            res.json({
                status: "ERROR",
                stdout: 'Error Instance create.'
            });
        } else {
            console.log('Instance Created.');
            data.instanceNum = vm.id;
            Instance.insertInstance(data, res);
        }
    });

};

module.exports.deleteInstance = function(req, res) {
    var idVmMongo = req.params.id;
    Instance.getVmId({ _id: idVmMongo }, res, function(result, res) {
        // console.log(result);
        var vm = one.getVM(parseInt(result.instanceNum));
        vm.action('delete', function(err, data) {
            if (err) {
                console.log(err.toString());
                return res.json({
                    'error': 'Error deleting VM (VIRT)'
                });
            }
            Instance.deleteInstance({ _id: idVmMongo }, res);
        });

    });
};

module.exports.startInstance = function(req, res) {
    var idVmMongo = req.params.id;
    Instance.getVmId({ _id: idVmMongo }, res, function(result, res) {
        // console.log(result);
        var vm = one.getVM(parseInt(result.instanceNum));
        vm.action('resume', function(err, data) {
            if (err) {
                console.log(err.toString());
                return res.json({
                    starus: "ERROR",
                    stdout: 'Error starting VM.<br>' + err.toString()
                });
            } else {
                return res.json({
                    status: "OK",
                    stdout: 'Starting VM ' + vmID + "."
                });
            }
        });
    });
};

module.exports.stopInstance = function(req, res) {
    var idVmMongo = req.params.id;
    Instance.getVmId({ _id: idVmMongo }, res, function(result, res) {
        // console.log(result);
        var vm = one.getVM(parseInt(result.instanceNum));
        var forced = req.params.forced;
        var action = 'poweroff';
        if (forced === true) {
            action = 'poweroff-hard';
        }
        vm.action(action, function(err, data) {
            if (err) {
                console.log(err.toString());
                return res.json({
                    starus: "ERROR",
                    stdout: 'Error poweroff VM.<br>' + err.toString()
                });
            } else {
                return res.json({
                    status: "OK",
                    stdout: 'Poweroff VM ' + vmID + "."
                });
            }
        });
    });
};

module.exports.pauseInstance = function(req, res) {
    var idVmMongo = req.params.id;
    Instance.getVmId({ _id: idVmMongo }, res, function(result, res) {
        // console.log(result);
        var vm = one.getVM(parseInt(result.instanceNum));
        vm.action('suspend', function(err, data) {
            if (err) {
                console.log(err.toString());
                return res.json({
                    starus: "ERROR",
                    stdout: 'Error suspending VM.<br>' + err.toString()
                });
            } else {
                return res.json({
                    status: "OK",
                    stdout: 'Suspending VM ' + vmID + "."
                });
            }
        });
    });
};

module.exports.restartInstance = function(req, res) {
    var idVmMongo = req.params.id;
    Instance.getVmId({ _id: idVmMongo }, res, function(result, res) {
        // console.log(result);
        var vm = one.getVM(parseInt(result.instanceNum));
        var forced = req.params.forced;
        var action = 'reboot';
        if (forced === true) {
            action = 'reboot-hard';
        }
        vm.action(action, function(err, data) {
            if (err) {
                console.log(err.toString());
                return res.json({
                    starus: "ERROR",
                    stdout: 'Error rebooting VM.<br>' + err.toString()
                });
            } else {
                return res.json({
                    status: "OK",
                    stdout: 'Rebooting VM ' + vmID + "."
                });
            }
        });
    });
};

module.exports.statusInstance = function(req, res) {
    var idVmMongo = req.params.id;
    Instance.getVmId({ _id: idVmMongo }, res, function(result, res) {
        // console.log(result);
        var vm = one.getVM(parseInt(result.instanceNum));
        var doc = {
            details: {}
        };

        vm.info(function(err, data) {
            if (err) {
                console.log(err.toString());
                return res.json({
                    status: "ERROR",
                    stdout: 'Error getting VM details.<br>' + err.toString()
                });
            }

            if (parseInt(data.VM.STATE) >= 3 && parseInt(data.VM.LCM_STATE) === 3) {
                doc.details.status = 'running';
            } else if (parseInt(data.VM.STATE) === 8 && parseInt(data.VM.LCM_STATE) === 0) {
                doc.details.status = 'stopped';
            } else if (parseInt(data.VM.STATE) === 5 && parseInt(data.VM.LCM_STATE) === 0) {
                doc.details.status = 'paused';
            } else {
                doc.details.status = 'pending';
            }

            doc.details.interfaces = [];

            if (data.VM.TEMPLATE.NIC) {
                if (Array.isArray(data.VM.TEMPLATE.NIC)) {
                    for (var i = 0; i < data.VM.TEMPLATE.NIC.length; i++) {
                        doc.details.interfaces.push({
                            'id': data.VM.TEMPLATE.NIC[i].NIC_ID,
                            'ip': data.VM.TEMPLATE.NIC[i].IP,
                            'mac': data.VM.TEMPLATE.NIC[i].MAC
                        });
                    }
                } else {
                    doc.details.interfaces.push({
                        'id': data.VM.TEMPLATE.NIC.NIC_ID,
                        'ip': data.VM.TEMPLATE.NIC.IP,
                        'mac': data.VM.TEMPLATE.NIC.MAC
                    });
                }
            }
            return res.json({
                status: "OK",
                stdout: doc
            });
        });
    });
};

module.exports.getAllInstances = function(req, res) {
    Instance.getallinstances(res);
};