/* global module */

require('colors');
var cp = require('child_process'),
    Collector = require('./lib/collector/collector.js');


var collector = new Collector("http://172.168.1.75:8080");
collector.init();