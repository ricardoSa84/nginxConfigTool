window.LocationView = Backbone.View.extend({
    textRegex: /^\w+$/,
    portRegex: /^0*(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/,
    ipRegex: /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/,
    locationname: null,
    selectedOpts: "",
    optionsToDropdown: "",
    lastHeight: -1,
    countoption: 0,
    allOption: [],
    allListOptions: "",
    events: {
        'keyup input': function() {
            this.checkImputs();
        },
        "click .option-add": "addnewoption",
        "click .option-remove": function(e) {
            var self = this;
            var optName = $(e.target).parent().parent().parent().parent().attr("data-option");
            $(e.target).parent().parent().parent().parent().parent().remove();
            self.allOption[optName] = null;
        },
        "change .btn-on-off": function(evt) {
            var self = this;
            if ((!$(self.el).find(".control-cache-ext").prop('checked') && !$(self.el).find(".control-cache-path").prop('checked')) || (!$(self.el).find(".control-cache-ext").prop('checked') && $(self.el).find(".control-cache-path").prop('checked')) || ($(self.el).find(".control-cache-ext").prop('checked') && !$(self.el).find(".control-cache-path").prop('checked'))) {

                if ($(self.el).find(evt.target).prop('checked') && $(self.el).find(evt.target).parent().parent().parent().parent().hasClass("collapsed-box")) {
                    $(self.el).find(evt.target).parent().next().click();
                }
                if (!$(self.el).find(evt.target).prop('checked') && !$(self.el).find(evt.target).parent().parent().parent().parent().hasClass("collapsed-box")) {
                    $(self.el).find(evt.target).parent().next().click();
                }
                if ($(self.el).find(".control-cache-ext").prop('checked') || $(self.el).find(".control-cache-path").prop('checked')) {
                    if (self.lastHeight !== 0) {
                        self.lastHeight = $(self.el).find(".location-path").height();
                    }
                    $(self.el).find(".location-path").animate({
                        "height": 0
                    }, 500);
                    $(self.el).find(".location-input").parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                }
                if (!$(self.el).find(".control-cache-ext").prop('checked') && !$(self.el).find(".control-cache-path").prop('checked')) {
                    $(self.el).find(".location-path").animate({
                        "height": self.lastHeight
                    }, 500);
                    $(self.el).find(".location-input").parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                }

                if ($(self.el).find(".control-cache-ext").prop('checked')) {
                    $(self.el).find(".control-cache-path").bootstrapToggle('disable');

                } else if (!$(self.el).find(".control-cache-ext").prop('checked')) {
                    $(self.el).find(".control-cache-path").bootstrapToggle('enable');
                }

                if ($(self.el).find(".control-cache-path").prop('checked')) {
                    $(self.el).find(".control-cache-ext").bootstrapToggle('disable');

                } else if (!$(self.el).find(".control-cache-path").prop('checked')) {
                    $(self.el).find(".control-cache-ext").bootstrapToggle('enable');
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
            self.selectedOpts = opts.slice(0, -1);
            self.checkImputs();
        },
    },
    initialize: function() {
        var self = this;

        modem("GET",
            '/ext/all',
            function(data) {
                var options = "";
                for (var i in data) {
                    options += "<optgroup label='" + data[i].text + "'>";
                    for (var j in data[i].ext.sort()) {
                        options += "<option>" + data[i].ext[j] + "</option>";
                    }
                    options += "</optgroup>";
                }
                self.optionsToDropdown = options;
                $(self.el).find(".select-extensao").html(self.optionsToDropdown);
                $(self.el).find('.selectpicker').selectpicker();

                $(self.el).find('.btn-on-off').bootstrapToggle();
            },
            function(xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
            }, {});


        modem("GET",
            '/options/Location',
            function(data) {
                var options = "<option></option>";
                for (var i in data[0].options.sort()) {
                    options += "<option>" + data[0].options[i] + "</option>";
                }
                self.allListOptions = options;
                self.addnewoption();
            },
            function(xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
            }, {});

    },
    checkImputs: function() {
        var self = this;
        $(self.el).find('.valid-input').each(function(i, obj) {

            if (!$.isArray($(self.el).find(obj).val())) {
                $(self.el).find(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");

                switch ($(self.el).find(obj).data("typevalue")) {
                    case "location-option":
                        if ($(self.el).find(obj).val().trim().match(self.textRegex)) {
                            $(self.el).find(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                        } else {
                            $(self.el).find(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                        }
                        break;
                }
            }
        });
        if ($(self.el).find(".control-cache-ext").prop('checked')) {
            if (self.selectedOpts.trim().length > 0) {
                $(self.el).find(".select-extensao").parent().parent().parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
            } else {
                $(self.el).find(".select-extensao").parent().parent().parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
            }
        } else {
            $(self.el).find(".select-extensao").parent().parent().parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
        }

        if ($(self.el).find(".control-cache-path").prop('checked')) {
            if (self.selectedOpts.trim().length > 0) {
                $(self.el).find(".select-path").parent().parent().parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
            } else {
                $(self.el).find(".select-path").parent().parent().parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
            }
        } else {
            $(self.el).find(".select-path").parent().parent().parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
        }
    },
    addnewoption: function(e) {
        var self = this;
        if (e) {
            $(e.target).removeClass("fa-plus-circle").addClass("fa-minus-circle");
            $(e.target).parent().removeClass("option-add").addClass("option-remove");
            $(e.target).parent().attr('data-original-title', "Remove row.");
        }
        this.optionView = new OptionView({ model: this.model });
        $(this.el).find(".option-list").append(this.optionView.render().el);
        this.optionView.init("option-" + self.countoption, self.allListOptions);
        self.allOption["option-" + self.countoption] = self.optionView;
        self.countoption++;
    },
    getLocationJson: function() {
        var self = this;
        
        // Validação das opções selecionadas
        // for (var i in self.allOption) {
        //     if (self.allOption[i]) {
        //         var obj = self.allOption[i].getValidOption();
        //         if (obj.valid) {
        //             console.log(obj);
        //         } else {
        //             showmsg('.my-modal', "warning", "Existe erros campos nas opções por completar!", false);
        //             return;
        //         }
        //     }
        // }

        var objJson = "Teste -> " + self.locationname;
        return objJson;
    },
    init: function(name) {
        var self = this;
        self.locationname = name;
        $(self.el).find(".well").attr("data-location", self.locationname);

        $(self.el).find('.slider-cache-ext, .slider-cache-path').slider().on('slide', function(ev) {
            $(self.el).find("." + $(ev.target).data("extid") + "-value").text(this.value);
        });

        $(self.el).find(".slider").css({
            width: "100%"
        });
        $(self.el).find(".slider-cache-ext-value, .slider-cache-path-value").parent().css({
            "margin-top": 0
        });
        $.AdminLTE.boxWidget.activate();

    },
    render: function() {
        var self = this;
        $(self.el).html(self.template());
        return self;
    }
});
