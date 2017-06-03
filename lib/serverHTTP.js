/* global module, __dirname, process */

require('colors'); //bold, italic, underline, inverse, yellow, cyan, white, magenta, green, red, grey, blue, rainbow
var express = require('express');
var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');
var serverIo = require('./serverio');
var bodyParser = require('body-parser');
var cp = require('child_process');
var ini = require('ini');
var nginxutils = require("./nginxutils");
var dbUsers;

/**
 * Construtor do servidor HTTP
 * @param {type} configdb Consiguracao da base de dados
 * @returns {ServerHTTP}
 */
 var ServerHTTP = function (data) {
  this.app = express();
  this.server = http.Server(this.app);
  this.io = socketio(this.server);
  this.port = data.port;

  dbUsers = require('./db.js');
  // Carrega para o script as configuraacoes da base de dados
  dbUsers.configDB(this.configDB);
};

/**
 * Inicia o servodor
 * @returns {undefined}
 */
 ServerHTTP.prototype.start = function () {
  var self = this;
  self.server.listen(self.port);
  this.skt = new serverIo({server: self}).init();

  var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date');
    next();
  };

// Configura o servidor
this.app.use(bodyParser.json({limit: '10mb'}));
this.app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
this.app.use(allowCrossDomain);

  // fornece ao cliente a pagina index.html
  this.app.use(express.static(__dirname + './../public'));

// Envia as configuracoes da base de dados para o script de acesso aos dados dos useres
dbUsers.dbData = this.dbData;

// Login do utilizador
this.app.post("/login", dbUsers.loginUser);

// Devolve as configuracoes do ficheiro Ini
this.app.get("/paramsinifile", nginxutils.getinifileparams);

this.app.post('/nginx/reload', nginxutils.reloadnginx);

this.app.post('/nginx/test', nginxutils.testserver);

// Guarda as configuracoess para o novo servidor
this.app.post("/saveserver", nginxutils.saveserver);

// Devolde a ultima atualizacao do git
this.app.get("/getGitLastUpdate", nginxutils.getLastGitUpdate);

console.log('\nServer HTTP Wait %s'.green.bold, self.port);
};

/**
 * Monitoriza o processo e para receber as informacoes para a criacao do servidor HTTP
 * @param {type} param1
 * @param {type} param2
 */
 process.on("message", function (data) {
  var srv = new ServerHTTP(data.serverdata);
  srv.start();
});
 module.exports = ServerHTTP;