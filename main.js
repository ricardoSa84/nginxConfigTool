/* global module */

require('colors');
var cp = require('child_process'),
    config = require('./config.js');

var Main = function() {
    var args = {
        port: config.serverHttpParams.porthttp,
        stationServer: config.serverHttpParams.stationServer,
        stationPort: config.serverHttpParams.stationPort
    };
    // inicia p script e envia as configuracores do ficheiro ini
    var child2 = cp.fork('./lib/serverHTTP');
    child2.send({ "serverdata": args });
};

// Inicia o script Iniciaol
new Main();

module.exports = Main;