var Dashboard = function(port, appExp, station) {
  this.station = station;

  this.port = port;
  this.app = appExp;
};

Dashboard.prototype.init = function() {
  var self = this;
  console.log('(server) Dashboard server listening on port ' + this.port);

  this.app.get('/stats/:hostname', function(req, res) {
    var keys = Object.keys(self.station.collectors);

    var hostname = req.params.hostname;
    if (hostname === 'all') {
      hostname = undefined;
    }
    var outputStats;
    var outputCacheStats;

    for (var i = 0; i < keys.length; i++) {
      var collector = self.station.collectors[keys[i]];
      if (hostname === keys[i] || hostname === undefined) {
        outputStats = collector.appendStatistics(outputStats, collector.statistics);
        outputCacheStats = collector.appendData(outputCacheStats, collector.cacheStatistics);
      }
    }
    if (outputStats) {
      if (outputStats.requesttime) {
        outputStats.requesttime /= keys.length;
      }
      
      if (outputStats.upstreamtime) {
        outputStats.upstreamtime /= keys.length;
      }
    }

    res.json({
      'statistics': outputStats,
      'hostnames': keys,
      'top': {
        'error': self.station.topErrors,
        'requests': self.station.topRequests,
        'sites': self.station.topHostnames
      },
      'cache': outputCacheStats,
      'date': new Date().getTime()
    });
  });
};

module.exports = Dashboard;
