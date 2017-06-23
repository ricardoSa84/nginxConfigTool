'use strict';
window.LocationView = Backbone.View.extend({
    textRegex: /^\w+$/,
    portRegex: /^0*(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/,
    ipRegex: /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/,
    locationname: null,
    selectedOptsExt: "",
    selectedOptsPath: "",
    optionsToDropdownExt: "",
    optionsToDropdownPath: "",
    lastHeight: -1,
    locationcontinue: false,
    countoptionlocation: 1,
    allOptionlocation: [],
    countoptionupstream: 1,
    allOptionupstream: [],
    allListOptionsLocation: "",
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
            self.allOptionlocation[self.locationname + "-loc-" + optName] = null;
        },
        "click .option-upstream-remove": function(e) {
            var self = this;
            var optName = $(e.target).parent().parent().parent().parent().attr("data-option");
            $(e.target).parent().parent().parent().parent().parent().remove();
            self.allOptionupstream[self.locationname + "-upst-" + optName] = null;
        },
        "change .btn-on-off": function(evt) {
            var self = this;

            if ((!$(self.el).find(".control-cache-ext").prop('checked') && !$(self.el).find(".control-cache-path").prop('checked') && !$(self.el).find(".control-upstream").prop('checked')) || // nenhum selecionado
                (!$(self.el).find(".control-cache-ext").prop('checked') && $(self.el).find(".control-cache-path").prop('checked') && !$(self.el).find(".control-upstream").prop('checked')) || // selecionado path
                ($(self.el).find(".control-cache-ext").prop('checked') && !$(self.el).find(".control-cache-path").prop('checked') && !$(self.el).find(".control-upstream").prop('checked')) || // selecionado ext
                (!$(self.el).find(".control-cache-ext").prop('checked') && !$(self.el).find(".control-cache-path").prop('checked') && $(self.el).find(".control-upstream").prop('checked'))) { // selecionado upstream

                if ($(self.el).find(evt.target).prop('checked') && $(self.el).find(evt.target).parent().parent().parent().parent().hasClass("collapsed-box")) {
                    $(self.el).find(evt.target).parent().next().click();
                }
                if (!$(self.el).find(evt.target).prop('checked') && !$(self.el).find(evt.target).parent().parent().parent().parent().hasClass("collapsed-box")) {
                    $(self.el).find(evt.target).parent().next().click();
                }

                if ($(self.el).find(".control-cache-ext").prop('checked') ||
                    $(self.el).find(".control-upstream").prop('checked') ||
                    $(self.el).find(".control-cache-path").prop('checked')) {

                    // if (self.lastHeight !== 0) {
                    self.lastHeight = $(self.el).find(".location-path").height();
                    // }
                    $(self.el).find(".location-path").animate({
                        "height": 0
                    }, 500);
                    $(self.el).find(".location-input").parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                }


                if (!$(self.el).find(".control-cache-ext").prop('checked') &&
                    !$(self.el).find(".control-cache-path").prop('checked') &&
                    !$(self.el).find(".control-upstream").prop('checked')) {

                    $(self.el).find(".location-path").animate({
                        "height": self.lastHeight
                    }, 500);
                }

                if ($(self.el).find(".control-cache-ext").prop('checked')) {
                    $(self.el).find(".control-cache-path").bootstrapToggle('disable');
                    $(self.el).find(".control-upstream").bootstrapToggle('disable');

                } else if ($(self.el).find(".control-cache-path").prop('checked')) {
                    $(self.el).find(".control-cache-ext").bootstrapToggle('disable');
                    $(self.el).find(".control-upstream").bootstrapToggle('disable');

                } else if ($(self.el).find(".control-upstream").prop('checked')) {
                    $(self.el).find(".control-cache-ext").bootstrapToggle('disable');
                    $(self.el).find(".control-cache-path").bootstrapToggle('disable');

                } else if (!$(self.el).find(".control-cache-ext").prop('checked') &&
                    !$(self.el).find(".control-cache-path").prop('checked') &&
                    !$(self.el).find(".control-upstream").prop('checked')) {
                    $(self.el).find(".control-cache-ext").bootstrapToggle('enable');
                    $(self.el).find(".control-cache-path").bootstrapToggle('enable');
                    $(self.el).find(".control-upstream").bootstrapToggle('enable');
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
        }
    },
    initialize: function() {},
    checkImputs: function() {
        var self = this;
        $(self.el).find('.valid-input').each(function(i, obj) {
            if ($(self.el).find(obj)) {
                $(self.el).find(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");

                switch ($(self.el).find(obj).data("typevalue")) {
                    case "location-path":
                        if (!$(self.el).find(".control-upstream").prop('checked') && !$(self.el).find(".control-cache-path").prop('checked') && !$(self.el).find(".control-cache-ext").prop('checked')) {
                            if ($(self.el).find(obj).val().trim().length >= 1) {
                                $(self.el).find(obj).next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                                self.locationcontinue = true;
                            } else {
                                $(self.el).find(obj).next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                                self.locationcontinue = false;
                            }
                        }
                        break;
                    case "server-upstream-name":
                        if ($(self.el).find(".control-upstream").prop('checked')) {
                            if ($(self.el).find(obj).val().trim().length >= 1) {
                                $(self.el).find(obj).next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                                self.locationcontinue = true;
                            } else {
                                $(self.el).find(obj).next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                                self.locationcontinue = false;
                            }
                        }
                        break;
                    case "location-path-files":
                        if ($(self.el).find(".control-cache-path").prop('checked')) {
                            if ($(self.el).find(obj).val().trim().length >= 1) {
                                $(self.el).find(obj).next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                                self.locationcontinue = true;
                            } else {
                                $(self.el).find(obj).next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
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
                self.locationcontinue = true;
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
                self.locationcontinue = true;
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

        var classname = $(self.el).find(e.target).parent().parent().parent().parent().parent().parent().attr("data-container");

        var optionView = new OptionView({});
        $(self.el).find(".option-list-" + classname).append(optionView.render().el);
        if (classname === "location") {
            $(self.el).find(e.target).parent().removeClass("option-add").addClass("option-location-remove");
            optionView.init(self.locationname + "-option-" + self.countoptionlocation, self.allListOptionsLocation);
            self.allOptionlocation[self.locationname + "-loc-option-" + self.countoptionlocation] = optionView;
            self.countoptionlocation++;
        }
        if (classname === "upstream") {
            $(self.el).find(e.target).parent().removeClass("option-add").addClass("option-upstream-remove");
            optionView.init(self.locationname + "-upsteam-option-" + self.countoptionupstream, self.allListOptionsUpstream);
            self.allOptionupstream[self.locationname + "-upst-option-" + self.countoptionupstream] = optionView;
            self.countoptionupstream++;
        }

    },
    getLocationJson: function() {
        var self = this;
        var auxOptionName = self.locationname;
        var locJson = {};
        locJson = {
            locValid: false,
            locname: self.locationname,
            staicCacheExtentions: {},
            staicCachePath: {},
            options: [],
            upstreams: {}
        };

        if ($(self.el).find(".control-cache-path").prop('checked')) {
            locJson.staicCachePath.initLocPath = $(self.el).find(".initPathText").text();
            locJson.staicCachePath.locpath = self.selectedOptsPath.trim();
            locJson.staicCachePath.timecache = $(self.el).find(".slider-cache-path-value").text() + $(self.el).find(".select-cache-patht-time.selectpicker option:selected").val();
        }

        if ($(self.el).find(".control-cache-ext").prop('checked')) {
            locJson.staicCacheExtentions.locpath = self.selectedOptsExt.trim();
            locJson.staicCacheExtentions.timecache = $(self.el).find(".slider-cache-ext-value").text() + $(self.el).find(".select-cache-ext-time.selectpicker option:selected").val();
        }

        if ($(self.el).find(".control-upstream").prop('checked')) {
            locJson.upstreams.name = $(self.el).find('.server-upstream-name').val().trim();
            locJson.upstreams.options = [];

            // Validação das opções selecionadas
            for (var i in self.allOptionupstream) {
                if (i.indexOf(self.locationname + "-upst") != -1) {
                    if (self.allOptionupstream[i]) {
                        var obj = self.allOptionupstream[i].getValidOption();
                        if (obj.valid) {
                            if (obj.text != '') {
                                locJson.upstreams.options.push(obj);
                            }
                        } else {
                            auxOptionName = obj.optname;
                            self.locationcontinue = false;
                        }
                    }
                }
            }
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
        locJson.locValid = self.locationcontinue;
        if (self.locationcontinue) {
            return locJson;
        } else {
            showmsg('.my-modal', "error", "Bad Values to Save, check the <i class='icon fa fa-close'>. " + capitalizeFirstAndReplaceArrow(auxOptionName), false);
        }
        return locJson;
    },
    init: function(name, optlocation, optUpstream, optExt, optPath) {
        var self = this;
        self.locationname = name;
        self.allListOptionsLocation = optlocation;
        self.allListOptionsUpstream = optUpstream;
        self.optionsToDropdownExt = optExt;
        self.optionsToDropdownPath = optPath;

        $(self.el).find(".well").attr("data-location", self.locationname);

        $(self.el).find(".num-location").html("Location " + '<span class="badge btn-default">' + self.locationname.split("-")[1] + '</span>'  + " Settings");

        $(self.el).find('.slider-cache-ext, .slider-cache-path').slider().on('slide', function(ev) {
            $(self.el).find("." + $(ev.target).data("extid") + "-value").text(this.value);
        });

        $(self.el).find(".slider").css({
            width: "100%"
        });
        $(self.el).find(".slider-cache-ext-value, .slider-cache-path-value").parent().css({
            "margin-top": 0
        });


        var optionView = new OptionView({});
        $(self.el).find(".option-list-location").append(optionView.render().el);
        optionView.init(self.locationname + "-option-" + self.countoptionlocation, self.allListOptionsLocation);
        self.allOptionlocation[self.locationname + "-loc-option-" + self.countoptionlocation] = optionView;
        self.countoptionlocation++;

        var optionView = new OptionView({});
        $(self.el).find(".option-list-upstream").append(optionView.render().el);
        optionView.init(self.locationname + "-upsteam-option-" + self.countoptionupstream, self.allListOptionsUpstream);
        self.allOptionupstream[self.locationname + "-upst-option-" + self.countoptionupstream] = optionView;
        self.countoptionupstream++;

        $('<select class="select-extensao selectpicker show-menu-arrow form-control" multiple data-live-search="true" title="Select extensions to Cache." data-actions-box="true">' + self.optionsToDropdownExt + '</select>').insertAfter($(self.el).find(".add-select-extensao"));

        $('<select class="select-path selectpicker show-menu-arrow form-control" multiple data-live-search="true" title="Select extensions to Cache." data-actions-box="true">' + self.optionsToDropdownPath + '</select>').insertAfter($(self.el).find(".add-select-path"));

        $(self.el).find('.selectpicker').selectpicker('refresh');

        $(self.el).find('.btn-on-off').bootstrapToggle();

        $.AdminLTE.boxWidget.activate();
    },
    render: function() {
        var self = this;
        $(self.el).html(self.template());
        return self;
    }
});