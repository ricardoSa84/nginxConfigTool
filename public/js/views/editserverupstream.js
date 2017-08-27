/* global Backbone, app */

window.EditServerUpstreamView = Backbone.View.extend({
    allInstances: [],
    instanceselected: "",
    optionUpstreamselected: "",
    upstreamCreatedOpt: null,
    events: {
        "change .select-upstream.selectpicker": function() {
            var self = this;
            var opt = "";
            $(self.el).find(".select-upstream.selectpicker option:selected").each(function(index, element) {
                opt += element.value;
            });
            self.optionUpstreamselected = opt;

            displayWait('.my-modal-wait');
            if (self.optionUpstreamselected == "newupstream") {
                console.log("Entrou");
                $(self.el).find(".upstream-settings").children().remove();
                var upstreamSettings = new UpstreamView({});
                $(self.el).find(".upstream-settings").html(upstreamSettings.render().el);
                upstreamSettings.init(null, self.instanceselected, false);
                self.upstreamCreatedOpt = upstreamSettings;
            } else {
                modem("GET",
                    '/nginx/getUpstreams/' + opt,
                    function(data) {
                        $(self.el).find(".upstream-settings").children().remove();
                        var upstreamSettings = new UpstreamView({});
                        $(self.el).find(".upstream-settings").html(upstreamSettings.render().el);
                        data.stdout.editmode = true;
                        upstreamSettings.init(data.stdout, self.instanceselected, true);
                        self.upstreamCreatedOpt = upstreamSettings;
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
            displayWait('.my-modal-wait');
            modem("GET",
                '/nginx/allUpstreamInstance/' + self.instanceselected,
                function(data) {
                    // console.log(data);
                    if (data.status === "OK") {
                        var opts = "";
                        for (var i in data.stdout) {
                            opts += "<option value='" + data.stdout[i]._id + "'>Upstream Name - " + data.stdout[i].name + "</option>";
                        }
                        opts += "<option value='newupstream'>Create New Upstream</option>";

                        $(self.el).find(".upstream-list").html('<label class="input-group-addon select-upstream-list">Select Server:</label><select class="select-upstream show-menu-arrow form-control selectpicker show-tick" data-live-search="true" title="Select Upstream.">' + opts + '</select>');

                        $(".select-upstream.selectpicker").html(opts);
                        $('.select-upstream.selectpicker').selectpicker('refresh');

                        hideMsg('.my-modal-wait');
                    } else {
                        hideMsg('.my-modal-wait');
                        $(".select-upstream.selectpicker").html("");
                        $('.select-upstream.selectpicker').selectpicker('refresh');
                        showmsg('.my-modal', "error", data.stdout, false);
                    }
                    $(self.el).find(".upstream-settings").html("<img class='center-block' alt='' src='./img/Nginx-Logo.png' style='width: 15%; height: auto'>" +
                        "<h1 class='text-center' style='text-shadow: -4px 4px hsla(0, 0%, 70%, .4),-3px 3px hsla(0, 0%, 60%, .2), -2px 2px hsla(0, 0%, 70%, .2), -1px 1px hsla(0, 0%, 70%, .2), 0px 0px hsla(0, 0%, 50%, .5), 1px -1px hsla(0, 0%, 30%, .6), 2px -2px hsla(0, 0%, 30%, .7), 3px -3px hsla(0, 0%, 32%, .8), 4px -4px hsla(0, 0%, 30%, .9), 5px -5px hsla(0, 0%, 30%, 1.0); font-family: 'Permanent Marker', cursive;'>Create or Edit Upstream Settings</h1>" +
                        "<hr class='soften' />");
                },
                function(xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                }, {});
        },
        "click .upstream-create": function() {
            var self = this;
            var upsSave = self.upstreamCreatedOpt.getUpstreamJson();
            if (upsSave) {
                modem("POST",
                    '/nginx/saveUpstreams',
                    function(data) {
                        console.log(data);
                        if (data.status === "OK") {
                            $(self.el).find('.select-upstream.selectpicker').find('[value="' + upsSave.instanceid + "-" + upsSave.name + '"]').remove();

                            $(self.el).find('.select-upstream.selectpicker').find('[value=newupstream]').remove();
                            $('.select-upstream.selectpicker').append('<option value="' + upsSave.instanceid + "-" + upsSave.name + '" selected="">Upstream Name - ' + upsSave.name + '</option>' + "<option value='newupstream'>Create New Upstream</option>");

                            $('.select-upstream.selectpicker').selectpicker("refresh");
                            $('.select-upstream.selectpicker').val(upsSave.instanceid + "-" + upsSave.name).change();
                            showmsg('.my-modal', "success", "The upstream has been correctly saved.", false);

                        } else if (data.status === "Upstream Exists") {
                            showmsg('.my-modal', "error", "This Upstrems, upstreamname '" + upsSave.name + ",' existes in this instance.", false);
                        } else {
                            showmsg('.my-modal', "error", data.stdout, false);
                        }
                    },
                    function(xhr, ajaxOptions, thrownError) {
                        var json = JSON.parse(xhr.responseText);
                        error_launch(json.message);
                    }, {
                        data: upsSave
                    });
            }
        },
        "click .remove-upstream": function() {
            var self = this;
            modem("DELETE",
                '/nginx/deleteUpstreams/' + self.optionUpstreamselected,
                function(data) {
                    // console.log(data);
                    if (data.status === "OK") {
                        showmsg('.my-modal', "success", data.stdout, false);
                        $(self.el).find('.select-upstream.selectpicker').find('[value="' + self.optionUpstreamselected + '"]').remove();
                        $('.select-upstream.selectpicker').selectpicker("refresh");
                        $(self.el).find(".upstream-settings").html("<img class='center-block' alt='' src='./img/Nginx-Logo.png' style='width: 15%; height: auto'>" +
                            "<h1 class='text-center' style='text-shadow: -4px 4px hsla(0, 0%, 70%, .4),-3px 3px hsla(0, 0%, 60%, .2), -2px 2px hsla(0, 0%, 70%, .2), -1px 1px hsla(0, 0%, 70%, .2), 0px 0px hsla(0, 0%, 50%, .5), 1px -1px hsla(0, 0%, 30%, .6), 2px -2px hsla(0, 0%, 30%, .7), 3px -3px hsla(0, 0%, 32%, .8), 4px -4px hsla(0, 0%, 30%, .9), 5px -5px hsla(0, 0%, 30%, 1.0); font-family: 'Permanent Marker', cursive;'>Create or Edit Upstream Settings</h1>" +
                            "<hr class='soften' />");
                    } else {
                        showmsg('.my-modal', "error", data.stdout, false);
                    }
                },
                function(xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                }, {});
        }
    },
    initialize: function(opt) {},
    init: function() {
        var self = this;
        $('body').on('input', function(e) {});
        hideMsg('.my-modal');
        $.AdminLTE.boxWidget.activate();

        modem("GET",
            '/vm/allInstances',
            function(data) {
                // console.log(data);
                if (data.status === "OK") {
                    var opts = "";
                    for (var i in data.stdout) {
                        opts += "<option value='" + data.stdout[i]._id + "'> Name - " + data.stdout[i].instanceName + " / Template - " + data.stdout[i].templateName + "</option>";
                        self.allInstances[data.stdout[i]._id] = data.stdout[i];
                    }
                    opts += "<option value='localhost'>Name - localhost / Template - localhost</option>";

                    $(".select-instance.selectpicker").html(opts);
                    $('.select-instance.selectpicker').selectpicker('refresh');
                }
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