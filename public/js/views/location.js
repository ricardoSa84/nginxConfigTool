'use strict';
window.LocationView = Backbone.View.extend({
    textRegex: /^\w+$/,
    portRegex: /^0*(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/,
    ipRegex: /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/,
    httpRegex: /^(http|https):\/\//,
    locationname: null,
    selectedOptsExt: "",
    selectedOptsPath: "",
    optionsToDropdownExt: "",
    optionsToDropdownPath: "",
    lastHeight: -1,
    locationcontinue: false,
    countoptionlocation: 1,
    allOptionlocation: [],
    upstreamSelectLocation: "",
    // countoptionupstream: 1,
    allOptionupstream: [],
    allListOptionsUpstream: "",
    events: {
        'keyup input': function() {
            this.checkImputs();
        },
        "click .option-add": "addnewoption",
        "click .option-location-remove": function(e) {
            var self = this;
            var optName = $(e.target).parent().parent().parent().parent().attr("data-option");
            $(e.target).parent().parent().parent().parent().parent().remove();
            self.allOptionlocation[optName] = null;
        },
        "change .btn-on-off": function(evt) {
            var self = this;

            if ((!$(self.el).find(".control-cache-ext").prop('checked') && !$(self.el).find(".control-cache-path").prop('checked') /* && !$(self.el).find(".control-upstream").prop('checked')*/ ) || // nenhum selecionado
                (!$(self.el).find(".control-cache-ext").prop('checked') && $(self.el).find(".control-cache-path").prop('checked') /* && !$(self.el).find(".control-upstream").prop('checked')*/ ) || // selecionado path
                ($(self.el).find(".control-cache-ext").prop('checked') && !$(self.el).find(".control-cache-path").prop('checked') /* && !$(self.el).find(".control-upstream").prop('checked')) ||*/ // selecionado ext
                    /*(!$(self.el).find(".control-cache-ext").prop('checked') && !$(self.el).find(".control-cache-path").prop('checked') && $(self.el).find(".control-upstream").prop('checked')*/
                )) { // selecionado upstream

                if ($(self.el).find(evt.target).prop('checked') && $(self.el).find(evt.target).parent().parent().parent().parent().hasClass("collapsed-box")) {
                    $(self.el).find(evt.target).parent().next().click();
                }
                if (!$(self.el).find(evt.target).prop('checked') && !$(self.el).find(evt.target).parent().parent().parent().parent().hasClass("collapsed-box")) {
                    $(self.el).find(evt.target).parent().next().click();
                }

                if ($(self.el).find(".control-cache-ext").prop('checked') || $(self.el).find(".control-cache-path").prop('checked') /* || $(self.el).find(".control-upstream").prop('checked')*/ ) {

                    // if (self.lastHeight !== 0) {
                    self.lastHeight = $(self.el).find(".location-path").height();
                    // }
                    $(self.el).find(".location-path").animate({
                        "height": 0
                    }, 500);
                    $(self.el).find(".location-input").parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                }

                if (!$(self.el).find(".control-cache-ext").prop('checked') && !$(self.el).find(".control-cache-path").prop('checked') /* && !$(self.el).find(".control-upstream").prop('checked')*/ ) {

                    $(self.el).find(".location-path").animate({
                        "height": self.lastHeight
                    }, 500);
                }

                if ($(self.el).find(".control-cache-ext").prop('checked')) {
                    $(self.el).find(".control-cache-path").bootstrapToggle('disable');
                    // $(self.el).find(".control-upstream").bootstrapToggle('disable');

                } else if ($(self.el).find(".control-cache-path").prop('checked')) {
                    $(self.el).find(".control-cache-ext").bootstrapToggle('disable');
                    // $(self.el).find(".control-upstream").bootstrapToggle('disable');

                } else if (!$(self.el).find(".control-cache-ext").prop('checked') && !$(self.el).find(".control-cache-path").prop('checked') /* && !$(self.el).find(".control-upstream").prop('checked')*/ ) {
                    $(self.el).find(".control-cache-ext").bootstrapToggle('enable');
                    $(self.el).find(".control-cache-path").bootstrapToggle('enable');
                    // $(self.el).find(".control-upstream").bootstrapToggle('enable');
                }
            }
            this.checkImputs();
        },
        "change .select-extensao.selectpicker": function(evt) {
            var self = this;
            var opts = "";
            $(self.el).find(".select-extensao.selectpicker option:selected").each(function(index, element) {
                opts += element.text + "|";
            });
            self.selectedOptsExt = opts.slice(0, -1);
            self.checkImputs();
        },
        "change .select-path.selectpicker": function(evt) {
            var self = this;
            var opts = "";
            $(self.el).find(".select-path.selectpicker option:selected").each(function(index, element) {
                opts += element.text + "|";
            });
            self.selectedOptsPath = opts.slice(0, -1);
            self.checkImputs();
        },
        "change .select-upstream-location.selectpicker": function(e) {
            var self = this;
            var opts = "";
            $(self.el).find(".select-upstream-location.selectpicker option:selected").each(function(index, element) {
                opts += element.text;
            });
            self.upstreamSelectLocation = opts;
            this.checkImputs();
        },
        "change .control-upstream-select-location": function() {
            var self = this;
            $(self.el).find(".input-proxy-pass-location").remove();
            if ($(self.el).find(".control-upstream-select-location").prop('checked')) {
                $('<div class="input-proxy-pass-location row">' +
                    '<div class="col-md-2">' +
                    '<input class="control-upstream-protocol-location btn-on-off-upstream" type="checkbox" data-toggle="tooltip" data-on="HTTPS://" data-off="HTTP://" data-size="small" data-onstyle="default" title="">' +
                    '</div>' +
                    '<div class="col-md-9">' +
                    '<select class="select-upstream-location selectpicker valid-input show-menu-arrow form-control show-tick" data-typevalue="host-proxy" data-actions-box="true">' + self.allListOptionsUpstream + '</select>' +
                    '</div>' +
                    '</div>').insertAfter($(self.el).find(".add-proxy-pass-opt-location"));
                $('.select-upstream-location.selectpicker').selectpicker();
                $(self.el).find('.btn-on-off-upstream').bootstrapToggle();
                self.upstreamSelectLocation = "";
            } else {
                $('<input class="host-proxy input-proxy-pass-location valid-input form-control" data-typevalue="host-proxy" type="text " placeholder="http://127.0.0.1:3000" value="">').insertAfter($(self.el).find(".add-proxy-pass-opt-location"));
            }
            self.checkImputs();
        }
    },
    initialize: function() {},
    checkImputs: function() {
        var self = this;
        self.locationcontinue = true;
        $(self.el).find('.valid-input').each(function(i, obj) {
            if ($(self.el).find(obj)) {
                $(self.el).find(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");

                switch ($(self.el).find(obj).data("typevalue")) {
                    case "location-path":
                        if (!$(self.el).find(".control-cache-path").prop('checked') && !$(self.el).find(".control-cache-ext").prop('checked')) {
                            if ($(self.el).find(obj).val().trim().length >= 1) {
                                $(self.el).find(obj).next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                                self.locationcontinue = (self.locationcontinue === false ? false : true);
                            } else {
                                $(self.el).find(obj).next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                                self.locationcontinue = false;
                            }
                        }
                        break;
                    case "host-proxy":
                        if (!$(self.el).find(".control-upstream-select-location").prop('checked')) {
                            if ($(self.el).find(obj).val().trim().match(self.httpRegex) && $(self.el).find(obj).val().trim().replace(self.httpRegex, "").length > 3) {
                                $(self.el).find(obj).next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                                self.locationcontinue = self.locationcontinue === false ? false : true;
                            } else if ($(self.el).find(obj).val().trim().length === 0) {
                                $(self.el).find(".input-proxy-pass-location").next().children().removeClass("fa-close color-red fa-check color-green");
                                self.locationcontinue = self.locationcontinue === false ? false : true;
                            } else {
                                $(self.el).find(obj).next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                                self.locationcontinue = false;
                            }
                        } else if ($(self.el).find(".control-upstream-select-location").prop('checked')) {
                            if (self.upstreamSelectLocation.trim().length > 0) {
                                $(self.el).find(".select-upstream-location").parent().parent().next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                                self.locationcontinue = self.locationcontinue === false ? false : true;
                            } else {
                                $(self.el).find(".select-upstream-location").parent().parent().next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                                self.locationcontinue = false;
                            }
                        }
                        break;
                }
            }
        });
        if ($(self.el).find(".control-cache-ext").prop('checked')) {
            if (self.selectedOptsExt.trim().length > 0) {
                $(self.el).find(".select-extensao").parent().next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                self.locationcontinue = (self.locationcontinue === false ? false : true);
            } else {
                $(self.el).find(".select-extensao").parent().next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                self.locationcontinue = false;
            }
        } else {
            $(self.el).find(".select-extensao").selectpicker('deselectAll');
        }

        if ($(self.el).find(".control-cache-path").prop('checked')) {
            if (self.selectedOptsPath.trim().length > 0) {
                $(self.el).find(".select-path").parent().next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                self.locationcontinue = (self.locationcontinue === false ? false : true);
            } else {
                $(self.el).find(".select-path").parent().next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                self.locationcontinue = false;
            }
        } else {
            $(self.el).find(".select-path").selectpicker('deselectAll');
        }
    },
    addnewoption: function(e) {
        var self = this;
        if (e) {
            $(self.el).find(e.target).removeClass("fa-plus-circle").addClass("fa-minus-circle");
            $(self.el).find(e.target).parent().attr('data-original-title', "Remove row.");
        }

        var optionView = new OptionView({});
        $(self.el).find(".option-list-location").append(optionView.render().el);
        $(self.el).find(e.target).parent().removeClass("option-add").addClass("option-location-remove");
        optionView.init(self.locationname + "-loc-option-" + self.countoptionlocation, self.allListOptionsLocation, "location");
        self.allOptionlocation[self.locationname + "-loc-option-" + self.countoptionlocation] = optionView;
        self.countoptionlocation++;
    },
    getLocationJson: function() {
        var self = this;
        var auxOptionName = self.locationname;
        var locJson = {};

        locJson = {
            locValid: false,
            locname: self.locationname,
            locationPath: $(self.el).find(".location-input").val().trim(),
            staicCacheExtentions: {},
            staicCachePath: {},
            options: []
        };

        if ($(self.el).find(".control-cache-ext").prop('checked')) {
            locJson.staicCacheExtentions.locpath = self.selectedOptsExt.trim();
            locJson.staicCacheExtentions.timecache = $(self.el).find(".slider-cache-ext-value").text() + $(self.el).find(".select-cache-ext-time.selectpicker option:selected").val();
        }

        if ($(self.el).find(".control-cache-path").prop('checked')) {
            locJson.staicCachePath.initLocPath = $(self.el).find(".initPathText").val().trim();
            locJson.staicCachePath.locpath = self.selectedOptsPath.trim();
            locJson.staicCachePath.timecache = $(self.el).find(".slider-cache-path-value").text() + $(self.el).find(".select-cache-path-time.selectpicker option:selected").val();
        }

        // Validação das opções selecionadas
        for (var i in self.allOptionlocation) {
            if (i.indexOf(self.locationname + "-loc") != -1) {
                if (self.allOptionlocation[i]) {
                    var obj = self.allOptionlocation[i].getValidOption();
                    if (obj.valid) {
                        if (obj.text != '') {
                            locJson.options.push(obj);
                        }
                    } else {
                        auxOptionName = obj.optname;
                        self.locationcontinue = false;
                    }
                }
            }
        }
        if ($(self.el).find(".control-upstream-select-location").prop('checked') || $(self.el).find('.host-proxy.input-proxy-pass-location').val().trim().length > 10) {
            locJson.options.push({
                optname: self.locationname + "-loc-option-" + self.countoptionlocation,
                valid: true,
                select: "proxy_pass",
                text: (function() {
                    if ($(self.el).find(".control-upstream-select-location").prop('checked')) {
                        if ($(self.el).find(".control-upstream-protocol-location").prop('checked')) {
                            return "https://" + self.upstreamSelectLocation.trim();
                        } else {
                            return "http://" + self.upstreamSelectLocation.trim();
                        }
                    } else {
                        return $(self.el).find('.host-proxy.input-proxy-pass-location').val().trim();
                    }
                })()
            });
        }
        locJson.locValid = self.locationcontinue;
        if (self.locationcontinue) {
            return locJson;
        } else {
            showmsg('.my-modal', "error", "Bad Values to Save, check the <b>x</b>. " + capitalizeFirstAndReplaceArrow(auxOptionName) + "<br>", false);
            return null;
        }
    },
    init: function(name, optlocation, optUpstream, optExt, optPath, location) {
        var self = this;
        if (location) {
            self.electedOptsExt = "";
            self.selectedOptsPath = "";
            self.optionsToDropdownExt = "";
            self.optionsToDropdownPath = "";
            self.lastHeight = -1;
            self.locationcontinue = false;
            self.countoptionlocation = 1;
            self.allOptionlocation = [];
            // self.countoptionupstream = 1;
            // self.allOptionupstream = [];
            self.allListOptionsLocation = "";
            self.allListOptionsUpstream = "";
        }
        self.locationname = name;
        self.allListOptionsLocation = optlocation;
        self.allListOptionsUpstream = optUpstream;
        self.optionsToDropdownExt = optExt;
        self.optionsToDropdownPath = optPath;

        $(self.el).find(".well").attr("data-location", self.locationname);

        $(self.el).find(".num-location").html("Location " +
            '<span class="badge btn-default">' + self.locationname.split("-")[1] + '</span>' + " Settings");

        $(self.el).find('.slider-cache-ext, .slider-cache-path').slider().on('slide', function(ev) {
            $(self.el).find("." + $(ev.target).data("extid") + "-value").text(this.value);
        });

        $(self.el).find(".slider").css({ width: "100%" });
        $(self.el).find(".slider-cache-ext-value, .slider-cache-path-value").parent().css({ "margin-top": 0 });

        var optionView = new OptionView({});
        $(self.el).find(".option-list-location").append(optionView.render().el);
        optionView.init(self.locationname + "-loc-option-" + self.countoptionlocation, self.allListOptionsLocation, "location");
        self.allOptionlocation[self.locationname + "-loc-option-" + self.countoptionlocation] = optionView;
        self.countoptionlocation++;

        $('<select class="select-extensao selectpicker show-menu-arrow form-control" multiple data-live-search="true" title="Select extensions to Cache." data-actions-box="true">' + self.optionsToDropdownExt + '</select>').insertAfter($(self.el).find(".add-select-extensao"));

        $('<select class="select-path selectpicker show-menu-arrow form-control" multiple data-live-search="true" title="Select extensions to Cache." data-actions-box="true">' + self.optionsToDropdownPath + '</select>').insertAfter($(self.el).find(".add-select-path"));

        $(self.el).find('.selectpicker').selectpicker('refresh');

        $(self.el).find('.btn-on-off, .btn-on-off-upstream').bootstrapToggle();

        $.AdminLTE.boxWidget.activate();
        if (location) {
            self.setLocation(location);
        }
    },
    setLocation: function(location) {
        var self = this;
        // console.log(location);
        if (location) {
            $(self.el).find(".location-input").val(location.locationPath);

            for (var i = 0; i < location.options.length; i++) {
                if (location.options[i].select !== "proxy_pass") {
                    self.allOptionlocation[self.locationname + "-loc-option-" + (self.countoptionlocation - 1)].setOption(location.options[i].select, location.options[i].text);
                    if (i !== location.options.length - 1) {
                        $(self.el).find(".option-list-location .option-add .fa").click();
                    }
                } else {
                    $(self.el).find('.host-proxy.input-proxy-pass-location').val(location.options[i].text);
                }
            }

            if (location.staicCacheExtentions) {
                $(self.el).find(".control-cache-ext").prop('checked', true).change();
                self.selectedOptsExt = location.staicCacheExtentions.locpath;
                var exts = location.staicCacheExtentions.locpath.split("|");
                $(self.el).find('.select-extensao.selectpicker').val(exts);
                $(self.el).find('.select-extensao.selectpicker').selectpicker('render');
                var timeSelect = location.staicCacheExtentions.timecache.substr(location.staicCacheExtentions.timecache.length - 1);
                var time = location.staicCacheExtentions.timecache.slice(0, -1);
                $(self.el).find(".slider-cache-ext-value").text(time);
                $(self.el).find(".slider-cache-ext").slider('setValue', time);
                $(self.el).find('.select-cache-ext-time.selectpicker').val(timeSelect);
                $(self.el).find('.select-cache-ext-time.selectpicker').selectpicker('render');
            }

            if (location.staicCachePath) {
                $(self.el).find(".initPathText").val(location.staicCachePath.initLocPath);
                $(self.el).find(".control-cache-path").prop('checked', true).change();
                self.selectedOptsPath = location.staicCachePath.locpath;
                var paths = location.staicCachePath.locpath.split("|");
                $(self.el).find('.select-path.selectpicker').val(paths);
                $(self.el).find('.select-path.selectpicker').selectpicker('render');
                var timeSelect = location.staicCachePath.timecache.substr(location.staicCachePath.timecache.length - 1);
                var time = location.staicCachePath.timecache.slice(0, -1);

                $(self.el).find(".slider-cache-path-value").text(time);
                $(self.el).find(".slider-cache-path").slider('setValue', time);

                $(self.el).find('.select-cache-path-time.selectpicker').val(timeSelect);
                $(self.el).find('.select-cache-path-time.selectpicker').selectpicker('render');
            }

            // if (location.upstreams.name) {
            //     $(self.el).find(".control-upstream").prop('checked', true).change();
            //     $(self.el).find('.server-upstream-name').val(location.upstreams.name);
            //     for (var i = 0; i < location.upstreams.options.length; i++) {
            //         self.allOptionupstream[self.locationname + "-upst-option-" + (self.countoptionupstream - 1)].setOption(location.upstreams.options[i].select, location.upstreams.options[i].text);
            //         if (i !== location.upstreams.options.length - 1) {
            //             $(self.el).find(".option-list-upstream .option-add .fa").click();
            //         }
            //     }
            // }
            self.checkImputs();
        }
    },
    render: function() {
        var self = this;
        $(self.el).html(self.template());
        return self;
    }
});