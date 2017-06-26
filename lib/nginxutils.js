/* global module */

require('colors');
var cp = require('child_process');
var fs = require('fs');
var ini = require('ini');
var utils = require("./utils");
var ServerHost = require('./models/server.js');

ServerHost = new ServerHost();

module.exports.saveserver = function(req, res) {
    var settingsServer = req.body.data;
    settingsServer._id = settingsServer.servername + "-" + settingsServer.port;
    ServerHost.InsertServerHost(settingsServer, res);
    // console.log(settingsServer);
    // utils.processReceivedJson(settingsServer, res);
    /*
    fs.writeFile('/etc/nginx/conf.d/' + settingsServer.proxy.SERVERNAME + '.conf',
        utils.prepareConf('simpleproxy', settingsServer),
        function(err) {
            if (err) {
              return res.status(500).send({
                'status': 'failed',
                'message': err
            });
          }
          res.send({
              'status': 'created'
          });
      });
      */
};

module.exports.getallservers = function(req, res) {
    ServerHost.getAllServers(req, res);
};

module.exports.getserverid = function(req, res) {
    ServerHost.getserverid(req.params.server, res);
};

module.exports.testserver = function(req, res) {
    var testNginx = false;
    var output = cp.spawnSync('/usr/sbin/nginx', ['-t'], {
        encoding: 'utf8'
    });
    if (output.stderr.toString().indexOf("syntax is ok") > -1 && output.stderr.toString().indexOf("test is successful") > -1) {
        testNginx = true;
    }

    res.send({
        'status': testNginx ? 'nginx test ok' : 'nginx test fail',
        'stdout': output.stderr
    });
};


/**
 * Reinicia o SO
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.reloadnginx = function(req, res) {
    var reloadNginx = false;
    var output = cp.spawnSync('/usr/sbin/nginx', ['-s', 'reload'], {
        encoding: 'utf8'
    });
    if (output.stderr.toString().indexOf("syntax is ok") > -1 && output.stderr.toString().indexOf("test is successful") > -1) {
        reloadNginx = true;
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
