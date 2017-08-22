/* global Backbone, normalizeString, app */
'use strict';
window.SettingsView = Backbone.View.extend({
    textRegex: /^\w+$/,
    portRegex: /^0*(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/,
    ipRegex: /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/,
    httpRegex: /^(http|https):\/\//,
    selectedInstance: "localhost",
    selectedOpts: "",
    servercontinue: false,
    countlocation: 1,
    allLocations: [],
    optionsListserver: [],
    allListOptionsServer: "",
    optionsListdefault: [],
    allListOptionsDefault: "",
    allListOptionsUpstream: "",
    optionsToDropdownExt: "",
    optionsToDropdownPath: "",
    optscountserver: 1,
    optscountdefault: 1,
    ajaxReqServer: false,
    ajaxReqLocation: false,
    ajaxReqUpstreams: false,
    ajaxReqPathExt: false,
    editmode: false,
    lastkey: "",
    events: {
        'keyup input': function() {
            this.checkImputs();
        },
        "change .btn-on-off": function(evt) {
            var self = this;
            $(self.el).find(evt.target).parent().next().click();
        },
        "click .option-add": "addnewoptionserver",
        "click .option-remove-server": function(e) {
            var self = this;
            var optName = $(e.target).parent().parent().parent().parent().attr("data-option");
            $(e.target).parent().parent().parent().parent().parent().remove();
            self.optionsListserver[optName] = null;
        },
        "click .option-remove-default-location": function(e) {
            var self = this;
            var optName = $(e.target).parent().parent().parent().parent().attr("data-option");
            $(e.target).parent().parent().parent().parent().parent().remove();
            self.optionsListdefault[optName] = null;
        },
        "click .test-nginx": function(){
            this.testeNginx(null);
        },
        "click .restart-nginx": function() {
            this.testeNginx(function() {
                displayWait('.my-modal-wait');
                modem("POST", '/nginx/reload', function(data) {
                    hideMsg('.my-modal-wait');
                    // console.log('chegou aqui:', data);
                    if (data.status === "nginx reload ok") {
                        $('.restart-nginx').prop('disabled', false);
                        showmsg('.my-modal', "success", "NGinx Test OK!", true);
                    } else {
                        $('.restart-nginx').prop('disabled', true);
                        showmsg('.my-modal', "error", data.stdout.replace(/\n/g, '<br>'), false);
                    }
                }, function(xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                }, {});
            });
        },
        "click .remove-row": function(evt) {
            var self = this;
            var locname = $(self.el).find(evt.target).parent().parent().parent().parent().parent().parent().attr("data-location");
            $(self.el).find('[data-location=' + locname + ']').remove();
            self.allLocations[locname] = null;
        },
        "click .add-new-location": function() {
            var self = this;
            var locationView = new LocationView({});
            $(self.el).find(".server-locations").append(locationView.render().el);
            locationView.init("location-" + self.countlocation, self.allListOptionsDefault, self.allListOptionsUpstream, self.optionsToDropdownExt, self.optionsToDropdownPath);
            self.allLocations["location-" + self.countlocation] = locationView;
            self.countlocation++;
        }
    },
    initialize: function() {
        this.listenTo(this.model, 'change', this.render);
    },
    checkServerRemove: function() {
        var self = this;
        var idServer = $(self.el).find('.host-name').val().trim() + "-" + $(self.el).find('.host-port').val().trim();
        if (self.lastkey === idServer) {
            return idServer;
        } else {
            showmsg('.my-modal', "warning", "The server name or port was changed. The server is not removed.", false);
            return null;
        }
    },
    addnewoptionserver: function(e) {
        var self = this;
        $(e.target).removeClass("fa-plus-circle").addClass("fa-minus-circle");
        $(e.target).parent().attr('data-original-title', "Remove row.");

        var classname = $(self.el).find(e.target).parent().parent().parent().parent().parent().parent().attr("data-container");

        var optionView = new OptionView({});
        //os pedaços dentro do if tb da para fazer função para chamar evitando repetir código
        if (classname === "server") {
            $(e.target).parent().removeClass("option-add").addClass("option-remove-server");
            $(self.el).find(".option-list-" + classname).append(optionView.render().el);
            optionView.init("server-option-" + self.optscountserver, self.allListOptionsServer);
            self.optionsListserver["server-option-" + self.optscountserver] = optionView;
            self.optscountserver++;
        }
        if (classname === "default-location") {
            $(e.target).parent().removeClass("option-add").addClass("option-remove-default-location");
            $(self.el).find(".option-list-" + classname).append(optionView.render().el);
            optionView.init("default-location-option-" + self.optscountdefault, self.allListOptionsDefault);
            self.optionsListdefault["default-location-option-" + self.optscountdefault] = optionView;
            self.optscountdefault++;
        }
    },
    init: function(server, instancesrv) {
        var self = this;
        $("#server-ip:input").inputmask();
        $('body').on('input', function(e) {});
        hideMsg('.my-modal');
        $.AdminLTE.boxWidget.activate();
        self.selectedOpts = "";
        self.servercontinue = false;
        self.countlocation = 1;
        self.allLocations = [];
        self.optionsListserver = [];
        self.allListOptionsServer = "";
        self.optionsListdefault = [];
        self.allListOptionsDefault = "";
        self.allListOptionsUpstream = "";
        self.optionsToDropdownExt = "";
        self.optionsToDropdownPath = "";
        self.optscountserver = 1;
        self.optscountdefault = 1;
        self.editmode = false;
        self.lastkey = "";
        self.selectedInstance = instancesrv;
        if (server) {
            displayWait('.my-modal-wait');
        } else {
            $(self.el).find(".remove-server").parent().css({
                display: "none"
            });

        }

        //ISTO PODE SER OPTIMIZADO, COLOCAR NUMA PARTE COMUM PARA SER INVOCADA COM PARAMETRO (location || server || upstream)
        //E RETORNAR O ARRAY
        modem("GET", '/options/server', function(data) {
            var options = "<option></option>";
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    options += "<option>" + data[i].directive + "</option>";
                }
            }
            self.allListOptionsServer = options;
            var optionView = new OptionView({});
            $(self.el).find(".option-list-server").append(optionView.render().el);
            optionView.init("server-option-" + self.optscountserver, self.allListOptionsServer);
            self.optionsListserver["server-option-" + self.optscountserver] = optionView;
            self.optscountserver++;
            self.ajaxReqServer = true;
            self.gerateServerSaved(server);

        }, function(xhr, ajaxOptions, thrownError) {
            var json = JSON.parse(xhr.responseText);
            error_launch(json.message);
        }, {});
        modem("GET", '/options/location', function(data) {
            var options = "<option></option>";
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    options += "<option>" + data[i].directive + "</option>";
                }
            }
            self.allListOptionsDefault = options;
            var optionView = new OptionView({});
            $(self.el).find(".option-list-default-location").append(optionView.render().el);
            optionView.init("default-location-option-" + self.optscountdefault, self.allListOptionsDefault);
            self.optionsListdefault["default-location-option-" + self.optscountdefault] = optionView;
            self.optscountdefault++;
            self.ajaxReqLocation = true;
            self.gerateServerSaved(server);

        }, function(xhr, ajaxOptions, thrownError) {
            var json = JSON.parse(xhr.responseText);
            error_launch(json.message);
        }, {});

        modem("GET", '/options/upstream', function(data) {
            var options = "<option></option>";
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    options += "<option>" + data[i].directive + "</option>";
                }
            }
            self.allListOptionsUpstream = options;
            self.ajaxReqUpstreams = true;
            self.gerateServerSaved(server);
        }, function(xhr, ajaxOptions, thrownError) {
            var json = JSON.parse(xhr.responseText);
            error_launch(json.message);
        }, {});

        modem("GET", '/ext/all', function(data) {
                var options1 = "";
                var options2 = "";
                for (var i in data) {
                    options1 += "<optgroup label='" + data[i].text + "'>";
                    if (data[i].type === "ext") {
                        for (var j in data[i].ext.sort()) {
                            options1 += "<option>" + data[i].ext[j] + "</option>";
                        }
                    }
                    if (data[i].type === "path") {
                        for (var k in data[i].ext.sort()) {
                            options2 += "<option>" + data[i].ext[k] + "</option>";
                        }
                    }
                    options1 += "</optgroup>";
                }
                self.optionsToDropdownExt = options1;
                self.optionsToDropdownPath = options2;
                self.ajaxReqPathExt = true;
                self.gerateServerSaved(server);
            },
            function(xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
            }, {});

        $(self.el).find('.btn-on-off').bootstrapToggle();

        self.checkImputs();
    },
    checkImputs: function() {
        var self = this;
        self.servercontinue = true;
        $(self.el).find('.valid-input').each(function(i, obj) {
            if ($(self.el).find(obj)) {
                $(self.el).find(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                switch ($(self.el).find(obj).data("typevalue")) {
                    case "host-name":
                        if ($(self.el).find(obj).val().trim().match(self.textRegex)) {
                            $(self.el).find(obj).next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                            self.servercontinue = self.servercontinue === false ? false : true;
                        } else {
                            $(self.el).find(obj).next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                            self.servercontinue = false;
                        }
                        break;
                    case "host-port":
                        if ($(self.el).find(obj).val().trim().match(self.portRegex)) {
                            $(self.el).find(obj).next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                            self.servercontinue = self.servercontinue === false ? false : true;
                        } else {
                            $(self.el).find(obj).next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                            self.servercontinue = false;
                        }
                        break;
                    case "host-proxy":
                        // var ipPort = $(self.el).find(obj).val().trim().split(":");
                        // if (ipPort[0].match(self.ipRegex) && ipPort[1].match(self.portRegex)) {
                        if ($(self.el).find(obj).val().trim().match(self.httpRegex) && $(self.el).find(obj).val().trim().replace(self.httpRegex, "").length > 3) {
                            $(self.el).find(obj).next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                            self.servercontinue = self.servercontinue === false ? false : true;
                        } else {
                            $(self.el).find(obj).next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                            self.servercontinue = false;
                        }
                        break;
                }
            }
        });
    },
    servercreate: function() {
        var self = this;
        self.checkImputs();
        var serverconfig = {};
        var arrayUpstreamName = [];

        serverconfig = {
            servername: $(self.el).find('.host-name').val().trim(),
            instanceserver: self.selectedInstance,
            port: $(self.el).find('.host-port').val().trim(),
            serveropts: [],
            defaultLocation: {
                path: $(self.el).find('.location-input').val().trim(),
                proxy: $(self.el).find('.host-proxy').val().trim(),
                options: []
            },
            locations: []
        };

        for (var i in self.optionsListserver) {
            if (self.optionsListserver[i]) {
                var obj = self.optionsListserver[i].getValidOption();
                if (obj.valid) {
                    if (obj.text != '') {
                        serverconfig.serveropts.push(obj);
                    }
                    self.servercontinue = self.servercontinue === false ? false : true;
                } else {
                    showmsg('.my-modal', "error", "Bad Values to Save, check the Server options <b>x</b>. " + capitalizeFirstAndReplaceArrow(obj.optname), false);
                    self.servercontinue = false;
                    return;
                }
            }
        }
        for (var i in self.optionsListdefault) {
            if (self.optionsListdefault[i]) {
                var obj = self.optionsListdefault[i].getValidOption();
                if (obj.valid) {
                    if (obj.text != '') {
                        serverconfig.defaultLocation.options.push(obj);
                    }
                    self.servercontinue = self.servercontinue === false ? false : true;
                } else {
                    showmsg('.my-modal', "error", "Bad Values to Save, check the default location options <b>x</b>. " + capitalizeFirstAndReplaceArrow(obj.optname), false);
                    self.servercontinue = false;
                    return;
                }
            }
        }
        for (var i in self.allLocations) {
            if (self.allLocations[i]) {
                var loc = self.allLocations[i].getLocationJson();
                if (loc.locValid) {
                    if (loc.upstreams.name) {
                        arrayUpstreamName.push(loc.upstreams.name)
                    }
                    serverconfig.locations.push(loc);
                    self.servercontinue = self.servercontinue === false ? false : true;
                } else {
                    self.servercontinue = false;
                    return;
                }
            }
        }
        // console.log("upstreams", arrayUpstreamName, checkIfArrayIsUnique(arrayUpstreamName));

        if (checkIfArrayIsUnique(arrayUpstreamName)) {
            alert("Existe Upstreams com o mesmo nome. O Processo continua apenas está validação está em teste. Para alterar depois.");
        }
        if (self.servercontinue) {
            if (self.editmode) {
                serverconfig.editmode = self.editmode;
                serverconfig.lastkey = self.lastkey;
            }
            return serverconfig;
        } else {
            showmsg('.my-modal', "error", "Bad Values to Save, check the <b>x</b>.", false);
            return null;
        }
        console.log("----------------------------------------");
    },
    gerateServerSaved: function(server) {
        var self = this;
        if (!server && self.ajaxReqServer && self.ajaxReqLocation && self.ajaxReqUpstreams && self.ajaxReqPathExt) {
            $(".server-btns").html('<div class="col-md-2 "><button type="button" class="btn btn-default server-create btn-block"><label><i class="fa fa-save"></i> Create Server </label></button></div>');
            hideMsg('.my-modal-wait');
        } else if (server && self.ajaxReqServer && self.ajaxReqLocation && self.ajaxReqUpstreams && self.ajaxReqPathExt) {
            // console.log(server);
            self.editmode = server.editmode;
            self.lastkey = server[0].servername + "-" + server[0].port;
            $(self.el).find('.host-name').val(server[0].servername);
            $(self.el).find('.host-port').val(server[0].port);
            $(self.el).find('.location-input').val(server[0].defaultLocation.path);
            $(self.el).find('.host-proxy').val(server[0].defaultLocation.proxy);

            for (var i = 0; i < server[0].defaultLocation.options.length; i++) {
                self.optionsListdefault["default-location-option-" + (self.optscountdefault - 1)].setOption(server[0].defaultLocation.options[i].select, server[0].defaultLocation.options[i].text);
                if (i !== server[0].defaultLocation.options.length - 1) {
                    $(self.el).find(".option-list-default-location .option-add .fa").click();
                }
            }
            for (var i = 0; i < server[0].serveropts.length; i++) {
                self.optionsListserver["server-option-" + (self.optscountserver - 1)].setOption(server[0].serveropts[i].select, server[0].serveropts[i].text);
                if (i !== server[0].serveropts.length - 1) {
                    $(self.el).find(".option-list-server .option-add .fa").click();
                }
            }
            for (var i = 0; i < server[0].locations.length; i++) {
                var locationView = new LocationView({});
                $(self.el).find(".server-locations").append(locationView.render().el);
                locationView.init("location-" + self.countlocation, self.allListOptionsDefault, self.allListOptionsUpstream, self.optionsToDropdownExt, self.optionsToDropdownPath, server[0].locations[i]);
                self.allLocations["location-" + self.countlocation] = locationView;
                self.countlocation++;
            }
            self.checkImputs();
            $(".server-btns").html('<div class="col-md-2 "><button type="button" class="btn btn-default server-create btn-block"><label><i class="fa fa-save"></i> Save Server </label></button></div>' +
                '<div class="col-md-2"><button type="button " class="btn btn-default btn-block remove-server"><label><i class="fa fa-trash-o"></i> Remove Server</label></button></div>' +
                '<div class="col-md-2 "><button type="button " class="btn btn-default btn-block test-nginx"><label> Test Nginx </label></button></div>' +
                '<div class="col-md-2 "><button type="button " disabled class="btn btn-default btn-block restart-nginx"><label><i class="fa fa-refresh "></i></i> Restart Ngnix</label></button></div>');
            hideMsg('.my-modal-wait');
        }
    },
    testeNginx: function(callback) {
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
                    $('.restart-nginx').prop('disabled', false);
                }
                showmsg('.my-modal', "success", "NGinx Test OK!", true);
            } else if (data.status === 'nginx test warning') {
                $('.restart-nginx').prop('disabled', false);
                if (callback) {
                    callback();
                } else {
                    showmsg('.my-modal', "warning", data.stdout.replace(/\n/g, '<br>'), false);
                }
            } else {
                $('.restart-nginx').prop('disabled', true);
                showmsg('.my-modal', "error", data.stdout.replace(/\n/g, '<br>'), false);
            }
        }, function(xhr, ajaxOptions, thrownError) {
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