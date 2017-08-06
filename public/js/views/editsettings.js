/* global Backbone, normalizeString, app */
'use strict';
window.EditsettingsView = Backbone.View.extend({
    optionServerselected: "",
    instanceselected: "",
    events: {
        "change .select-server.selectpicker": function(e) {
            var self = this;
            var opt = "";
            $(self.el).find(".select-server.selectpicker option:selected").each(function(index, element) {
                opt += element.value;
            });
            self.optionServerselected = opt;
            if (self.optionServerselected == "newserver") {
                $(self.el).find(".server-settings").children().remove();
                var serverSettings = new SettingsView({});
                $(self.el).find(".server-settings").html(serverSettings.render().el);
                serverSettings.init(null, self.instanceselected);
            } else {
                modem("GET",
                    '/nginx/get/' + opt,
                    function(data) {
                        $(self.el).find(".server-settings").children().remove();
                        var serverSettings = new SettingsView({});
                        $(self.el).find(".server-settings").html(serverSettings.render().el);
                        data.stdout.editmode = true;
                        serverSettings.init(data.stdout, self.instanceselected);
                    },
                    function(xhr, ajaxOptions, thrownError) {
                        var json = JSON.parse(xhr.responseText);
                        error_launch(json.message);
                    }, {});
            }
        },
        "change .select-instance.selectpicker": function(e) {
            var self = this;
            var opt = "";
            $(self.el).find(".select-instance.selectpicker option:selected").each(function(index, element) {
                opt += element.value;
            });
            // console.log(opt);
            self.instanceselected = opt;
            modem("GET",
                '/nginx/allservers',
                function(data) {
                    var opts = /*"<option></option>"*/ "";
                    for (var i in data.stdout) {
                        var optserver = data.stdout[i]._id.split("-");
                        opts += "<option value='" + data.stdout[i]._id + "'> Hostname - " + optserver[0] + " / Port - " + optserver[1] + "</option>";
                    }
                    opts += "<option value='newserver'>Create New Server</option>";

                    $('<div class="col-md-6"><div class="input-group"><label class="input-group-addon select-server-list">Select Server:</label><select class="select-server show-menu-arrow form-control selectpicker show-tick" data-live-search="true" title="Select Server.">' + opts + '</select></div></div>').insertAfter($(self.el).find(".select-instance-list").parent().parent());

                    $(".select-server.select-server").html(opts);
                    $('.select-server.selectpicker').selectpicker('refresh');
                },
                function(xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                }, {});
        },
        "click .remove-server-ok": function() {
            var self = this;
            $(self.el).find(".server-settings").html("<img class='center-block' alt='' src='./img/Nginx-Logo.png' style='width: 15%; height: auto'>" +
                "<h1 class='text-center' style='text-shadow: -4px 4px hsla(0, 0%, 70%, .4),-3px 3px hsla(0, 0%, 60%, .2), -2px 2px hsla(0, 0%, 70%, .2), -1px 1px hsla(0, 0%, 70%, .2), 0px 0px hsla(0, 0%, 50%, .5), 1px -1px hsla(0, 0%, 30%, .6), 2px -2px hsla(0, 0%, 30%, .7), 3px -3px hsla(0, 0%, 32%, .8), 4px -4px hsla(0, 0%, 30%, .9), 5px -5px hsla(0, 0%, 30%, 1.0); font-family: 'Permanent Marker', cursive;'>Edit Server Settings</h1>" +
                "<hr class='soften' />");
            $(self.el).find(".select-server.selectpicker").find('[value=' + self.optionServerselected + ']').remove();
            $(self.el).find(".select-server.selectpicker").selectpicker('refresh');
            // console.log("remove-server-ok");
        }
    },
    initialize: function() {},
    init: function() {
        var self = this;
        $("#server-ip:input").inputmask();
        $('body').on('input', function(e) {});
        showInfoMsg(false, '.my-modal');
        $.AdminLTE.boxWidget.activate();
        $('.selectpicker').selectpicker('refresh');
    },
    render: function() {
        var self = this;
        $(this.el).html(this.template());
        return this;
    }
});