/* global Backbone, normalizeString, app */
'use strict';
window.SettingsView = Backbone.View.extend({
    textRegex: /^\w+$/,
    portRegex: /^0*(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/,
    ipRegex: /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/,
    selectedOpts: "",
    servercontinue: false,
    countlocation: 0,
    allLocations: [],
    optionsListserver: [],
    allListOptionsServer: "",
    optionsListdefault: [],
    allListOptionsDefault: "",
    allListOptionsUpstream: "",
    optionsToDropdownExt: "",
    optionsToDropdownPath: "",
    optscountserver: 0,
    optscountdefault: 0,
    events: {
        'keyup input': function() {
            this.checkImputs();
        },
        "change .btn-on-off": function(evt) {
            var self = this;
            $(self.el).find(evt.target).parent().next().click();
        },
        "click .option-remove-upstream": function(evt) {
            var self = this;
            console.log($(self.el).find(evt.target).parent().parent().parent().parent());
            $(self.el).find(evt.target).parent().parent().parent().parent().remove();
        },
        "click .option-add": "addnewoptionserver",
        "click .option-remove-server": function(e) {
            var self = this;
            var optName = $(e.target).parent().parent().parent().parent().attr("data-option");
            $(e.target).parent().parent().parent().parent().parent().remove();
            self.optionsListserver[optName] = null;
        },
        "click .save-settings": "savesettings",

        "click .test-nginx": function() {
            console.log('deu certo');
            modem("POST", '/nginx/test', function(data) {
                if (data.status === "nginx test ok") {
                    $('#restart-nginx').prop('disabled', false);
                    showmsg('.my-modal', "success", "NGinx Test OK!", true);
                } else {
                    $('#restart-nginx').prop('disabled', true);
                    showmsg('.my-modal', "error", data.stdout.replace(/\n/g, '<br>'), false);
                }
            }, function(xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
            }, {});
        },
        "click .restart-nginx": function() {
            modem("POST", '/nginx/reload', function(data) {
                if (data.status === "nginx reload ok") {
                    $('#restart-nginx').prop('disabled', false);
                    showmsg('.my-modal', "success", "NGinx Test OK!", true);
                } else {
                    $('#restart-nginx').prop('disabled', true);
                    showmsg('.my-modal', "error", data.stdout.replace(/\n/g, '<br>'), false);
                }
            }, function(xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
            }, {});
        },
        "click .remove-row": function(evt) {
            var self = this;
            var locname = $(self.el).find(evt.target).parent().parent().parent().parent().parent().parent().attr("data-location");
            $(self.el).find('[data-location=' + locname + ']').remove();
            self.allLocations[locname] = null;
        },
        "click .add-new-location": function() {
            var self = this;
            var locationView = new LocationView({ model: self.model });
            $(self.el).find(".server-locations").append(locationView.render().el);
            locationView.init("location-" + self.countlocation, self.allListOptionsDefault, self.allListOptionsUpstream, self.optionsToDropdownExt, self.optionsToDropdownPath);
            self.allLocations["location-" + self.countlocation] = locationView;
            self.countlocation++;
        }
    },
    initialize: function() {},
    addnewoptionserver: function(e) {
        var self = this;
        $(e.target).removeClass("fa-plus-circle").addClass("fa-minus-circle");
        $(e.target).parent().removeClass("option-add").addClass("option-remove-server");
        $(e.target).parent().attr('data-original-title', "Remove row.");

        var classname = $(self.el).find(e.target).parent().parent().parent().parent().parent().parent().attr("data-container");
        console.log(classname);
        self.optionView = new OptionView({ model: self.model });
        //os pedaços dentro do if tb da para fazer função para chamar evitando repetir código
        if (classname === "server") {
            $(self.el).find(".option-list-" + classname).append(self.optionView.render().el);
            self.optionView.init("option-" + self.optscountserver, self.allListOptionsServer);
            self.optionsListserver["option-" + self.optscountserver] = self.optionView;
            self.optscountserver++;
        }
        if (classname === "default-location") {
            $(self.el).find(".option-list-" + classname).append(self.optionView.render().el);
            self.optionView.init("option-" + self.optscountdefault, self.allListOptionsDefault);
            self.optionsListdefault["option-" + self.optscountdefault] = self.optionView;
            self.optscountdefault++;
        }
    },
    init: function() {
        var self = this;
        $("#server-ip:input").inputmask();
        $('body').on('input', function(e) {});
        showInfoMsg(false, '.my-modal');
        $.AdminLTE.boxWidget.activate();

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
            self.optionView = new OptionView({ model: self.model });
            $(self.el).find(".option-list-server").append(self.optionView.render().el);
            self.optionView.init("option-" + self.optscountserver, self.allListOptionsServer);
            self.optionsListserver["option-" + self.optscountserver] = self.optionView;
            self.optscountserver++;
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
            self.optionView = new OptionView({ model: self.model });
            $(self.el).find(".option-list-default-location").append(self.optionView.render().el);
            self.optionView.init("option-" + self.optscountdefault, self.allListOptionsDefault);
            self.optionsListdefault["option-" + self.optscountdefault] = self.optionView;
            self.optscountdefault++;

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
                self.optionsToDropdownPath = options2
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
        $(self.el).find('.valid-input').each(function(i, obj) {
            if ($(self.el).find(obj)) {
                $(self.el).find(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                switch ($(self.el).find(obj).data("typevalue")) {
                    case "host-name":
                        if ($(self.el).find(obj).val().trim().match(self.textRegex)) {
                            $(self.el).find(obj).next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                        } else {
                            $(self.el).find(obj).next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                        }
                        break;
                    case "host-port":
                        if ($(self.el).find(obj).val().trim().match(self.portRegex)) {
                            $(self.el).find(obj).next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                        } else {
                            $(self.el).find(obj).next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                        }
                        break;
                    case "host-proxy":
                        var ipPort = $(self.el).find(obj).val().trim().split(":");
                        if (ipPort[0].match(self.ipRegex) && ipPort[1].match(self.portRegex)) {
                            $(self.el).find(obj).next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                        } else {
                            $(self.el).find(obj).next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                        }
                        break;
                }
            }
        });
    },
    savesettings: function() {
        var self = this;
        var serverconfig = {};
        // if (self.servercontinue) {

        serverconfig = {
            servername: $(self.el).find('.host-name').val().trim(),
            port: $(self.el).find('.host-port').val().trim(),
            proxy: $(self.el).find('.host-proxy').val().trim(),
            serveropts: [],
            locations: []
        }

        serverconfig = {
            servername: $(self.el).find('.host-name').val().trim(),
            port: $(self.el).find('.host-port').val().trim(),
            serveropts: [],
            defaultLocation: {
                path: $(self.el).find('.location-input').val().trim(),
                proxy: $(self.el).find('.host-proxy').val().trim(),
                options: []
            },
            locations: []
        }

        for (var i in self.optionsListserver) {
            if (self.optionsListserver[i]) {
                var obj = self.optionsListserver[i].getValidOption();
                if (obj.valid) {
                    if (obj.text != '') {
                        serverconfig.serveropts.push(obj);
                    }
                } else {
                    showmsg('.my-modal', "warning", "Bad Values to Save, check the <i class='icon fa fa-close'>.", false);
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
                } else {
                    showmsg('.my-modal', "warning", "Bad Values to Save, check the <i class='icon fa fa-close'>.", false);
                    return;
                }
            }
        }

        for (var i in self.allLocations) {
            if (self.allLocations[i]) {
                serverconfig.locations.push(self.allLocations[i].getLocationJson());
            }
        }

        console.log('obj: ', serverconfig);

        // } else {
        //     showmsg('.my-modal', "error", "Bad Values to Save, check the <i class='icon fa fa-close'>.", false);
        // }
        // if ((($(".valid-input").length - 1) == $(".fa-check").length) ? true : false) {
        //     console.log("OK");
        //     var params = {
        //         'SERVERNAME': $('#host-name').val(),
        //         'PORT': $('#host-port').val(),
        //         'PROXY': $('#host-destination').val(),
        //         'CACHE': $("#control-cache").prop('checked'),
        //         'CACHEFILES': self.selectedOpts,
        //         'TIMECACHE': $("#slider-cache-value").attr("data-sliderValue") + $("#select-cache-time.selectpicker option:selected").val()
        //     };

        //     var paramsobj = {
        //         proxy: {
        //             'SERVERNAME': $('#host-name').val(),
        //             'PORT': $('#host-port').val(),
        //             'PROXY': "http://" + $('#host-destination').val()
        //         },
        //         cache: {
        //             'CACHE': $("#control-cache").prop('checked'),
        //             'PROXY': "http://" + $('#host-destination').val(),
        //             'CACHEFILES': self.selectedOpts,
        //             'TIMECACHE': $("#slider-cache-value").attr("data-sliderValue") + $("#select-cache-time.selectpicker option:selected").val()
        //         }
        //     }

        //     modem("POST",
        //         "/nginx/saveserver",
        //         function(data) {
        //             if (data.status === "created") {
        //                 $('#test-nginx').prop('disabled', false);
        //                 showmsg('.my-modal', "success", "Seved Settings!", true);
        //             } else {
        //                 $('#test-nginx').prop('disabled', true);
        //                 showmsg('.my-modal', "error", "Error", true);
        //             }
        //         },
        //         function(xhr, ajaxOptions, thrownError) {
        //             var json = JSON.parse(xhr.responseText);
        //             error_launch(json.message);
        //         }, {
        //             data: paramsobj
        //         });
        // } else {
        //     showmsg('.my-modal', "error", "Bad Values to Save, check the <i class='icon fa fa-close'>.", true);
        // }
    },
    render: function() {
        var self = this;
        $(this.el).html(this.template());
        return this;
    }
});
