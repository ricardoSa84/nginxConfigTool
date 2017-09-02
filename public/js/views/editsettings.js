/* global Backbone, normalizeString, app */
'use strict';
window.EditsettingsView = Backbone.View.extend({
    optionServerselected: "",
    instanceselected: "",
    allInstances: [],
    serverCreatedOpt: null,
    events: {
        "change .select-server.selectpicker": function(e) {
            var self = this;
            var opt = "";
            $(self.el).find(".select-server.selectpicker option:selected").each(function(index, element) {
                opt += element.value;
            });
            self.optionServerselected = opt;
            displayWait('.my-modal-wait');
            if (self.optionServerselected == "newserver") {
                $(self.el).find(".server-settings").children().remove();
                var serverSettings = new SettingsView({});
                $(self.el).find(".server-settings").html(serverSettings.render().el);
                serverSettings.init(null, self.instanceselected);
                self.serverCreatedOpt = serverSettings;
            } else {
                modem("GET",
                    '/nginx/get/' + opt,
                    function(data) {
                        $(self.el).find(".server-settings").children().remove();
                        var serverSettings = new SettingsView({});
                        $(self.el).find(".server-settings").html(serverSettings.render().el);
                        data.stdout.editmode = true;
                        serverSettings.init(data.stdout, self.instanceselected);
                        self.serverCreatedOpt = serverSettings;
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
                '/nginx/allServersInstance/' + self.instanceselected,
                function(data) {
                    // console.log(data);
                    if (data.status === "OK") {
                        var opts = "";
                        for (var i in data.stdout) {
                            var optserver = data.stdout[i]._id.split("-");
                            opts += "<option value='" + data.stdout[i]._id + "'> Hostname - " + optserver[1] + " / Port - " + optserver[2] + "</option>";
                        }
                        opts += "<option value='newserver'>Create New Server</option>";

                        $(self.el).find(".server-list").html('<label class="input-group-addon select-server-list">Select Server:</label><select class="select-server show-menu-arrow form-control selectpicker show-tick" data-live-search="true" title="Select Server.">' + opts + '</select>');

                        $(".select-server.selectpicker").html(opts);
                        $('.select-server.selectpicker').selectpicker('refresh');

                        hideMsg('.my-modal-wait');
                    } else {
                        hideMsg('.my-modal-wait');
                        $(".select-server.selectpicker").html("");
                        $('.select-server.selectpicker').selectpicker('refresh');
                        showmsg('.my-modal', "error", data.stdout, false);
                    }
                    $(self.el).find(".server-settings").html("<img class='center-block' alt='' src='./img/Nginx-Logo.png' style='width: 15%; height: auto'>" +
                        "<h1 class='text-center' style='text-shadow: -4px 4px hsla(0, 0%, 70%, .4),-3px 3px hsla(0, 0%, 60%, .2), -2px 2px hsla(0, 0%, 70%, .2), -1px 1px hsla(0, 0%, 70%, .2), 0px 0px hsla(0, 0%, 50%, .5), 1px -1px hsla(0, 0%, 30%, .6), 2px -2px hsla(0, 0%, 30%, .7), 3px -3px hsla(0, 0%, 32%, .8), 4px -4px hsla(0, 0%, 30%, .9), 5px -5px hsla(0, 0%, 30%, 1.0); font-family: 'Permanent Marker', cursive;'>Create or Edit Server Settings</h1>" +
                        "<hr class='soften' />" +
                        '<div class="row"><div class="col-md-12 "><div class="col-md-2 ">' +
                        '<button type="button " class="btn btn-default btn-block test-nginx"><label> Test Nginx </label></button></div><div class="col-md-2 ">' +
                        '<button type="button" class="btn btn-default btn-block restart-nginx"><label><i class="fa fa-refresh "></i></i> Restart Ngnix</label></button></div></div></div>');
                },
                function(xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                }, {});
        },
        "click .remove-server": function() {
            var self = this;
            var idServer = self.serverCreatedOpt.checkServerRemove();
            if (idServer) {
                var serverRemove = idServer;
                idServer = self.instanceselected + "-" + idServer;
                modem("POST",
                    "/nginx/removeserver",
                    function(data) {
                        if (data.status === "OK") {
                            $(self.el).find(".server-settings").html("<img class='center-block' alt='' src='./img/Nginx-Logo.png' style='width: 15%; height: auto'>" +
                                "<h1 class='text-center' style='text-shadow: -4px 4px hsla(0, 0%, 70%, .4),-3px 3px hsla(0, 0%, 60%, .2), -2px 2px hsla(0, 0%, 70%, .2), -1px 1px hsla(0, 0%, 70%, .2), 0px 0px hsla(0, 0%, 50%, .5), 1px -1px hsla(0, 0%, 30%, .6), 2px -2px hsla(0, 0%, 30%, .7), 3px -3px hsla(0, 0%, 32%, .8), 4px -4px hsla(0, 0%, 30%, .9), 5px -5px hsla(0, 0%, 30%, 1.0); font-family: 'Permanent Marker', cursive;'>Edit Server Settings</h1>" +
                                "<hr class='soften' />");
                            // console.log(serverRemove);
                            $(self.el).find(".select-server.selectpicker").find('[value=' + idServer + ']').remove();
                            $(self.el).find(".select-server.selectpicker").selectpicker('refresh');
                            showmsg('.my-modal', "success", "This server deleted.", false);
                        } else if (data.status === "ERROR") {
                            showmsg('.my-modal', "error", "Error to delete this server.", false);
                        }
                    },
                    function(xhr, ajaxOptions, thrownError) {
                        var json = JSON.parse(xhr.responseText);
                        error_launch(json.message);
                    }, { server: idServer });
            }
        },
        "click .server-create": "serversave",
        "click .test-nginx": function() {
            var self = this;
            this.reloadstatus(function() {
                self.testeNginx(null);
            });
        },
        "click .restart-nginx": function() {
            var self = this;
            this.reloadstatus(function() {
                self.testeNginx(function() {
                    displayWait('.my-modal-wait');
                    modem("POST", '/nginx/reload', function(data) {
                        hideMsg('.my-modal-wait');
                        // console.log('chegou aqui:', data);
                        if (data.status === "nginx reload ok") {
                            // $('.restart-nginx').prop('disabled', false);
                            showmsg('.my-modal', "success", "NGinx Test OK!", false);
                        } else if (data.status === 'nginx test warning') {
                            // $('.restart-nginx').prop('disabled', false);
                            showmsg('.my-modal', "warning", data.stdout.replace(/\n/g, '<br>'), false);
                        } else {
                            // $('.restart-nginx').prop('disabled', true);
                            showmsg('.my-modal', "error", data.stdout.replace(/\n/g, '<br>'), false);
                        }
                    }, function(xhr, ajaxOptions, thrownError) {
                        var json = JSON.parse(xhr.responseText);
                        error_launch(json.message);
                    }, {
                        data: self.instanceselected
                    });
                });
            });
        },
    },
    initialize: function() {},
    init: function() {
        var self = this;
        $("#server-ip:input").inputmask();
        $('body').on('input', function(e) {});
        hideMsg('.my-modal');
        $.AdminLTE.boxWidget.activate();
        $('.selectpicker').selectpicker('refresh');

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
    serversave: function() {
        var self = this;
        var serverconfig = self.serverCreatedOpt.servercreate();
        if (serverconfig) {
            serverconfig.instanceid = self.instanceselected;
            serverconfig.lastkey = self.instanceselected + "-" + serverconfig.lastkey;
            // console.log(serverconfig);
            self.reloadstatus(function() {
                modem("POST",
                    "/nginx/saveserver",
                    function(data) {
                        if (data.status === "OK") {
                            // $('.test-nginx').prop('disabled', false);
                            $(self.el).find('.select-server.selectpicker').find('[value=newserver]').remove();

                            $('.select-server.selectpicker').append('<option value="' + serverconfig.instanceid + "-" + serverconfig.servername + "-" + serverconfig.port + '" selected="">Hostname - ' + serverconfig.servername + ' / Port - ' + serverconfig.port + '</option>' + "<option value='newserver'>Create New Server</option>");
                            $('.select-server.selectpicker').selectpicker("refresh");
                            $('.select-server.selectpicker').val(serverconfig.instanceid + "-" + serverconfig.servername + "-" + serverconfig.port).change();
                            showmsg('.my-modal', "success", "The server has been correctly saved!", false);
                        } else if (data.status === "Server Exists") {
                            // $('.test-nginx').prop('disabled', true);
                            showmsg('.my-modal', "warning", "This server, ServerName '" + serverconfig.servername + "' port '" + serverconfig.port + "' already exists on the system.", false);

                        } else {
                            // $('.test-nginx').prop('disabled', true);
                            showmsg('.my-modal', "error", data.stdout, false);
                        }
                    },
                    function(xhr, ajaxOptions, thrownError) {
                        var json = JSON.parse(xhr.responseText);
                        error_launch(json.message);
                    }, {
                        data: serverconfig
                    });
            });
        }
    },
    testeNginx: function(callback) {
        var self = this;
        if (!callback) {
            displayWait('.my-modal-wait');
        }
        modem("POST", '/nginx/test', function(data) {
            if (!callback) {
                hideMsg('.my-modal-wait');
            }
            if (data.status === "nginx test ok") {
                if (callback) {
                    callback();
                } else {
                    // $('.restart-nginx').prop('disabled', false);
                    showmsg('.my-modal', "success", "NGinx Test OK!", false);
                }
            } else if (data.status === 'nginx test warning') {
                // $('.restart-nginx').prop('disabled', false);
                if (callback) {
                    callback();
                } else {
                    showmsg('.my-modal', "warning", data.stdout.replace(/\n/g, '<br>'), false);
                }
            } else {
                // $('.restart-nginx').prop('disabled', true);
                showmsg('.my-modal', "error", data.stdout.replace(/\n/g, '<br>'), false);
            }
        }, function(xhr, ajaxOptions, thrownError) {
            var json = JSON.parse(xhr.responseText);
            error_launch(json.message);
        }, {
            data: self.instanceselected
        });
    },
    reloadstatus: function(callback) {
        var self = this;
        modem("GET",
            '/vm/statusInstance/' + self.selectedInstance._id,
            function(data) {
                // console.log(data);
                if (data.status === "OK") {
                    callback();
                } else {
                    showmsg('.my-modal', "error", data.stdout, false);
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