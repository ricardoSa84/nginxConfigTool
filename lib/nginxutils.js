/* global module */

require('colors');
var cp = require('child_process');
var fs = require('fs');
var ini = require('ini');
var ServerHost = require('./models/server.js');

ServerHost = new ServerHost();

module.exports.saveserver = function(req, res) {
    var settingsServer = req.body.data;

    settingsServer._id = settingsServer.instanceid + "-" + settingsServer.servername + "-" + settingsServer.port;

    // console.log(settingsServer.editmode, settingsServer.lastkey === settingsServer._id);
    if (!settingsServer.editmode) {
        ServerHost.InsertServerHost(settingsServer, res);
    } else if (settingsServer.editmode && (settingsServer.lastkey === settingsServer._id)) {
        delete settingsServer.lastkey;
        delete settingsServer.editmode;
        ServerHost.removeServerHost(settingsServer, true, res);
    } else {
        delete settingsServer.lastkey;
        delete settingsServer.editmode;
        ServerHost.InsertServerHost(settingsServer, res);
    }
};

module.exports.getallservers = function(req, res) {
    ServerHost.getAllServers(req, res);
};

module.exports.getallServersInstance = function(req, res) {
    var instanceSel = req.params.server;
    ServerHost.getServerFromInstance(instanceSel, res);
};

module.exports.removerServerHost = function(req, res) {
    var server = {};
    server._id = req.body.server;
    ServerHost.removeServerHost(server, false, res);
};

module.exports.getserverid = function(req, res) {
    ServerHost.getserverid(req.params.server, res);
};

module.exports.testserver = function(req, res) {
    var testNginx = false;
    var output = cp.spawnSync('/usr/sbin/nginx', ['-t'], {
        encoding: 'utf8'
    });
    if (output.stderr.toString().indexOf("ignored") > -1 && output.stderr.toString().indexOf("syntax is ok") > -1 && output.stderr.toString().indexOf("test is successful") > -1) {
        res.send({
            'status': 'nginx test warning',
            'stdout': output.stderr
        });
    } else if (output.stderr.toString().indexOf("syntax is ok") > -1 && output.stderr.toString().indexOf("test is successful") > -1) {
        res.send({
            'status': 'nginx test ok',
            'stdout': output.stderr
        });
    } else {
        res.send({
            'status': 'nginx test fail',
            'stdout': output.stderr
        });
    }
};


/**
 * Reinicia o SO
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.reloadnginx = function(req, res) {
    var reloadNginx = true;
    var output = cp.spawnSync('/usr/sbin/nginx', ['-s', 'reload'], {
        encoding: 'utf8'
    });

    if (output.stderr.toString().indexOf("ignored") > -1) {
        reloadNginx = true;
    } else if (output.stderr.toString().length > 0) {
        reloadNginx = false;
    }

    res.send({
        'status': reloadNginx ? 'nginx reload ok' : 'nginx reload fail',
        'stdout': output.stderr
    });
};

/**
 * Desliga o SO
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.poweroffsystem = function(req, res) {
    res.json("PowerOff");
    console.log("System Poweroff");
    cp.exec("sudo poweroff", function(error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
};

module.exports.getLastGitUpdate = function(req, res) {
    cp.exec("git log -1 --format=%cd", function(error, stdout, stderr) {
        res.json(stdout);
    });
};

/**
 * Verifica se o ficheiro existe
 * @param {type} file
 * @returns {Boolean}
 */
var checkconfigexist = function(file) {
    var config;
    try {
        // try to get the override configuration file if it exists
        fs.readFileSync(file);
        config = true;
    } catch (e) {
        // otherwise, node.js barfed and we have to clean it up
        // use the default file
        config = false;
    }
    return config;
};