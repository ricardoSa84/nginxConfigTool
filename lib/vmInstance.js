var OpenNebula = require('opennebula'),
    fs = require('fs'),
    cp = require('child_process'),
    Instance = require('./models/instance.js'),
    config = require('./../config.js'),
    one = new OpenNebula(config.openNebulaparams.one.auth, config.openNebulaparams.one.host);

Instance = new Instance();

module.exports.templateList = function(req, res) {
    one.getTemplates(function(err, templates) {
        if (err) {
            console.log(err);
            return res.json({
                status: "ERROR",
                stdout: 'Error fetching template list.'
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
        return res.json({
            status: "OK",
            stdout: output
        });
    }, -2);
};

module.exports.createInstance = function(req, res) {
    // console.log("Req", req.body.data , config.openNebulaparams.one.network );
    var data = req.body.data;

    var scriptnstaller = fs.readFileSync(config.fileIntallerCollector).toString('utf-8');

    // console.log(scriptnstaller);
    scriptnstaller = scriptnstaller.replace(/[IPSTATION]/, config.serverHttpParams.stationServer + ":" + config.serverHttpParams.stationPort);
    // console.log(scriptnstaller);

    var scriptBase64 = new Buffer(scriptnstaller).toString('base64');
    scriptBase64 = scriptBase64.slice(0, -4);

    var template = one.getTemplate(parseInt(data.templateNum));
    var vmParams = 'CONTEXT=[' +
        'SET_HOSTNAME="' + data.instanceName.toString().replace(/ /g, "") + '", ' +
        'NETWORK="' + 'YES' + '", ' +
        'NETWORK_UNAME="' + config.openNebulaparams.one.network + '", ' +
        'SSH_PUBLIC_KEY="' + fs.readFileSync(config.sshKeyRoot).toString().replace(/[\n|\t]/g, "") + '", ' +
        'START_SCRIPT_BASE64="' + scriptBase64 + '", ' +
        'TARGET ="' + 'hda' + '"]\n' +
        'GRAPHICS=[' +
        'TYPE="' + 'vnc' + '", ' +
        'LISTEN="' + '0.0.0.0' + '"]\n' +
        'MEMORY="' + ((data.templateRam * 1024) || 1024) + '"\n' +
        'CPU="' + (data.templateCPU || 0.1) + '"\n' +
        'VCPU="' + 1 + '"\n' +
        'HYPERVISOR="' + 'kvm' + '"\n' +
        'NAME="' + data.templateName + '"\n' +
        'OS=[ARCH="' + 'x86_64' + '"]\n ' +
        'NIC=[NETWORK="' + config.openNebulaparams.one.network + '"]\n ' +
        'TEMPLATE_ID = "' + data.templateNum + '"\n';

    // console.log("ParamsVm2", vmParams);

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
                    status: "ERROR",
                    stdout: 'Error deleting VM (VIRT).'
                });
            }
            console.log("Remove ssh key to known_hosts");
            cp.execSync("sed -i '/" + result.details.interfaces[0].ip + "/d' /root/.ssh/known_hosts");
            Instance.deleteInstance({ _id: idVmMongo }, res);
        });
    });
};

module.exports.resizeInstance = function(req, res) {
    var vmobj = req.body.data;

    Instance.getVmId({ _id: vmobj.id }, res, function(result, res) {
        // console.log("Result", result);

        var vm = one.getVM(parseInt(result.instanceNum));
        vm.resize('MEMORY="' + ((vmobj.newInstance.templateRam * 1024) || 1024) + '"\nVCPU="' + (1 || 1) + '"\nCPU="' + (vmobj.newInstance.templateCPU || 0.1) + '"\n', true, function(err, datar) {
            if (err) {
                console.log(err.toString());
                return res.json({
                    status: "ERROR",
                    stdout: 'Error resizing VM,<br>' + err.toString()
                });
            }
            // update database
            result.templateCPU = vmobj.newInstance.templateCPU;
            result.templateRam = vmobj.newInstance.templateRam;
            Instance.updateInstance({ _id: vmobj.id }, result, res);

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
                    stdout: 'Starting VM ' + idVmMongo + "."
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
                    stdout: 'Poweroff VM ' + idVmMongo + "."
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
                    stdout: 'Suspending VM ' + idVmMongo + "."
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
                    stdout: 'Rebooting VM ' + idVmMongo + "."
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
            Instance.updateDetails(idVmMongo, doc, res);
        });
    });
};

module.exports.getAllInstances = function(req, res) {
    Instance.getallinstances(res);
};