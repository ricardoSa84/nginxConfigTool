/* global module */

require('colors');
var cp = require('child_process'),
    Collector = require('./collector/collector/collector.js');


var collector = new Collector();
collector.init();