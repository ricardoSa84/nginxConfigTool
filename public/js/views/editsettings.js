/* global Backbone, normalizeString, app */
'use strict';
window.EditsettingsView = Backbone.View.extend({
    events: {
        "change .select-server.selectpicker": function(e) {
            var self = this;
            var opt = "";
            $(self.el).find(".select-server.selectpicker option:selected").each(function(index, element) {
                opt += element.value;
            });
            modem("GET",
                '/nginx/get/' + opt,
                function(data) {
                    var serverSettings = new SettingsView({});
                    $(self.el).find(".server-settings").html(serverSettings.render().el);
                    serverSettings.init();
                    serverSettings.createServer(data.stdout);
                },
                function(xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                }, {});
        }
    },
    initialize: function() {},
    init: function() {
        var self = this;
        $("#server-ip:input").inputmask();
        $('body').on('input', function(e) {});
        showInfoMsg(false, '.my-modal');
        $.AdminLTE.boxWidget.activate();

        modem("GET",
            '/nginx/allservers',
            function(data) {
                var opts = /*"<option></option>"*/ "";
                for (var i in data.stdout) {
                    var opt = data.stdout[i]._id.split("-");
                    opts += "<option value='" + data.stdout[i]._id + "'> Hostname - " + opt[0] + " / Port - " + opt[1] + "</option>";
                }
                $(".select-server").html(opts);
                $('.selectpicker').selectpicker('refresh');
            },
            function(xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
            }, {});
    },
    render: function() {
        var self = this;
        $(this.el).html(this.template());
        return this;
    }
});
