/* global module */

require('colors');
var cp = require('child_process');
var fs = require('fs');
var ini = require('ini');
var crypto = require('crypto');

var Main = function () {
  var args = {
    port: 3000,
    stationServer: 'http://127.0.0.1',
    stationPort: 8080
  };
    // inicia p script e envia as configuracores do ficheiro ini
    var child2 = cp.fork('./lib/serverHTTP');
    child2.send({"serverdata" : args});
  };

// Inicia o script Iniciaol
new Main();

module.exports = Main;