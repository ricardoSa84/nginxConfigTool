/* global Backbone, normalizeString, app */
window.DashboardView = Backbone.View.extend({
    intervalevent: null,
    maxPoints: 150,
    hostname: 'all',
    codeChart: null,
    cacheChart: null,
    verbChart: null,
    bandwidthChart: null,
    gaugesChart: null,
    timesChart: null,
    hostnames: [],
    events: {
        "change .select-hostnam": function(e) {
            this.hostname = $(this.el).find(e.target).val().toLowerCase();
        },
        "click .btnClear": function() {
            this.clearCharts();
        }
    },
    initialize: function(skt) {},
    init: function() {
        var self = this;

        self.codeChart = new CodeChart('codeHolder', {
            'size': self.maxPoints
        });
        self.cacheChart = new CacheChart('cacheHolder', {
            'size': self.maxPoints
        });
        self.verbChart = new VerbChart('verbHolder', {
            'size': self.maxPoints
        });
        self.bandwidthChart = new BandwidthChart('bwHolder', {
            'size': self.maxPoints
        });
        self.timesChart = new TimesChart('timesHolder', {
            'size': self.maxPoints
        });
        self.gaugesChart = new GaugesChart({
            'size': self.maxPoints
        });

        self.codeChart.init();
        self.cacheChart.init();
        self.verbChart.init();
        self.bandwidthChart.init();
        self.timesChart.init();
        self.gaugesChart.init();

        clearInterval(intervalevent);

        var intervalevent = setInterval(function() {
            $.get('/stats/' + self.hostname, function(data) {
                self.codeChart.appendData(data.statistics);
                self.verbChart.appendData(data.statistics);
                self.bandwidthChart.appendData(data.statistics);
                self.timesChart.appendData(data.statistics);
                self.gaugesChart.appendData(data.statistics);
                self.populateHostname(data.hostnames);
                self.cacheChart.appendData(data);

                console.log(data.hostnames);
                // console.log(data);
                // console.log(data.cache);
                // console.log(data.statistics);

                var out = '<br><b>Top error:</b><br>' + data.top.error + '<br><br><b>Top Server:</b><br>' + data.top.requests + '<br><br><b>Top Domains:</b><br>';
                for (var i = 0; i < data.top.sites.length; i++) {
                    out += (i + 1) + ' - ' + data.top.sites[i] + '<br>';
                }
                $('#containerG5').html(out);
            });
        }, 2000);
        $(self.el).find('.selectpicker').selectpicker();

    },
    populateHostname: function(hosts) {
        var self = this;
        console.log("Hosts", hosts);
        var options = $(self.el).find('.select-hostname.selectpicker');
        for (var i = 0; i < hosts.length; i++) {
            if (self.hostnames.indexOf(hosts[i]) < 0) {
                self.hostnames.push(hosts[i]);
                options.append($("<option />").val(hosts[i]).text(hosts[i]));
            }
        }
        options.selectpicker('refresh');
    },
    clearCharts: function() {
        var self = this;
        self.codeChart.clear();
        self.cacheChart.clear();
        self.verbChart.clear();
        self.bandwidthChart.clear();
        self.timesChart.clear();
    },
    render: function() {
        var self = this;
        $(this.el).html(this.template());
        return this;
    }
});