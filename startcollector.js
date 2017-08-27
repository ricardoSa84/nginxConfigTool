/* global module */

require('colors');
var cp = require('child_process'),
    Collector = require('./lib/collector/collector.js');


var collector = new Collector("http://127.0.0.1:8080");
collector.init();