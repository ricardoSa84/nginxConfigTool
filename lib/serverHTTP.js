/* global module, __dirname, process */

require('colors'); //bold, italic, underline, inverse, yellow, cyan, white, magenta, green, red, grey, blue, rainbow
var express = require('express');
var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');
var bodyParser = require('body-parser');
var cp = require('child_process');
var ini = require('ini');
var serverIo = require('./serverio');
var nginxutils = require("./nginxutils");
var dbModels = require('./dbToModels.js');
var Station = require('./dashboard/station.js');
var Dashboard = require('./dashboard/dashboard.js');
var Collector = require('./collector/collector.js');
var vm = require('./vmInstance.js');

/**
 * Construtor do servidor HTTP
 * @param {type} configdb Consiguracao da base de dados
 * @returns {ServerHTTP}
 */
var ServerHTTP = function(data) {
    this.app = express();
    this.server = http.Server(this.app);
    this.io = socketio(this.server);
    this.port = data.port;
    this.stationServer = data.stationServer;
    this.stationPort = data.stationPort;
};

/**
 * Inicia o servodor
 * @returns {undefined} 
 */
ServerHTTP.prototype.start = function() {
    var self = this;
    self.server.listen(self.port);
    this.skt = new serverIo({ server: self }).init();

    var allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date');
        next();
    };

    // Configura o servidor
    this.app.use(bodyParser.json({ limit: '10mb' }));
    this.app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
    this.app.use(allowCrossDomain);

    // fornece ao cliente a pagina index.html
    this.app.use(express.static(__dirname + './../public'));
    
    var collector = new Collector(this.stationServer + ":" + this.stationPort);
    collector.init();

    var station = new Station(this.stationPort);
    station.init();

    var dashboard = new Dashboard(this.port, this.app, station);
    dashboard.init();


    // Envia as configuracoes da base de dados para o script de acesso aos dados dos useres
    dbModels.dbData = this.dbData;

    // Login do utilizador
    this.app.post("/login", dbModels.loginUser);

    // Devolde a ultima atualizacao do git
    this.app.get("/getGitLastUpdate", nginxutils.getLastGitUpdate);

    this.app.get('/ext/all', dbModels.getAllExt);
    this.app.get('/options/:place', dbModels.getOptionsToPlace);
    this.app.get('/optionsInfo/:info/:context', dbModels.getOptionInfo);

    this.app.get('/nginx/allservers', nginxutils.getallservers);
    this.app.get('/nginx/allServersInstance/:server', nginxutils.getAllServersInstance);
    this.app.get('/nginx/get/:server', nginxutils.getserverid);

    this.app.get('/nginx/allUpstreamInstance/:server', nginxutils.getAllUpstreamInstance);
    this.app.get('/nginx/getUpstreams/:upstream', nginxutils.getUpstream);
    this.app.post('/nginx/saveUpstreams', nginxutils.saveupstream);
    this.app.delete('/nginx/deleteUpstreams/:id', nginxutils.removeUpstream);

    this.app.post('/nginx/reload', nginxutils.reloadnginx);
    this.app.post('/nginx/test', nginxutils.testserver);
    
    this.app.post("/nginx/saveserver", nginxutils.saveserver);
    this.app.post("/nginx/removeserver", nginxutils.removerServerHost)


    this.app.get('/vm/getListTemplate', vm.templateList);
    this.app.get('/vm/allInstances', vm.getAllInstances);
    this.app.get('/vm/startInstance/:id', vm.startInstance);
    this.app.get('/vm/stopInstance/:id', vm.stopInstance);
    this.app.get('/vm/pauseInstance/:id', vm.pauseInstance);
    this.app.get('/vm/restartInstance/:id', vm.restartInstance);
    this.app.get('/vm/statusInstance/:id', vm.statusInstance);

    this.app.post('/vm/resizeInstance', vm.resizeInstance);
    this.app.post('/vm/createInstance', vm.createInstance);

    this.app.delete('/vm/deleteInstance/:id', vm.deleteInstance);


    dbModels.configDB(this.configDB);

    console.log('\nServer HTTP Wait %s'.green.bold, self.port);
};

/**
 * Monitoriza o processo e para receber as informacoes para a criacao do servidor HTTP
 * @param {type} param1
 * @param {type} param2
 */
process.on("message", function(data) {
    var srv = new ServerHTTP(data.serverdata);
    srv.start();
});
module.exports = ServerHTTP;