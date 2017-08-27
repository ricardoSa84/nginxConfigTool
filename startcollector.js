/* global module */

require('colors');
var cp = require('child_process'),
	collServer 0 require('./collectorServer.js'),
    Collector = require('./lib/collector/collector.js');


var collector = new Collector(collServer.collectorServer);
collector.init();