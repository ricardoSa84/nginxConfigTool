'use strict';
window.OptionView = Backbone.View.extend({
    optName: "",
    context: "",
    selectedOpt: "",
    continue: false,
    events: {
        "keyup .text-opt": function() {
            this.checkInput();
        },
        "change .select-opts-location": function() {
            var self = this;
            var opt = "";
            $(self.el).find(".select-opts-location option:selected").each(function(index, element) {
                opt = element.text;
            });
            self.selectedOpt = opt;
            if (opt.trim().length > 0) {
                $(self.el).find(".option-help").children().addClass("fa fa-info-circle");
                $(self.el).find(".option-help").attr('data-original-title', "Click View Info <br> '" + self.selectedOpt + "'");
                $(self.el).find(".option-help").attr('data-option-select', self.selectedOpt);
            } else {
                $(self.el).find(".option-help").children().removeClass("fa fa-info-circle");
                $(self.el).find(".option-help").attr('data-original-title', "");
                $(self.el).find(".option-help").attr('data-option-select', "");
            }
            self.checkInput();
        },
        "click .option-help": function(e) {
            var self = this;
            // console.log($(e.target).parent().attr('data-option-select'));
            modem("GET",
                '/optionsInfo/' + $(e.target).parent().attr('data-option-select') + "/" + self.context,
                function(data) {
                    if (data.status === "OK") {
                        showmsg('.my-modal', "info",
                            '<br><br><span class="label label-primary"><i><b>Syntax</b></i></span> : ' + data.stdout[0].directives[0].syntax + ";<br><br>" +
                            '<span class="label label-primary"><i><b>Default</b></i></span> : ' + data.stdout[0].directives[0].default+";<br><br>" +
                            '<span class="label label-primary"><i><b>Variables</b></i></span> : ' + function() {
                                var textVar = "";
                                for (var i in data.stdout[0].variables) {
                                    textVar += data.stdout[0].variables[i] + "; ";
                                }
                                return textVar;
                            }() + "<br><br>" +
                            '<span class="label label-primary"><i><b>Context</b></i></span> : ' + data.stdout[0].directives[0].context + ";<br><br><br>" +
                            "<a href='" + data.stdout[0].pageUrlInfo + "' target='blank'>More Info</a>", false);
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
    initialize: function() {
    },
    checkInput: function() {
        var self = this;
        self.continue = true;
        $(self.el).find(".text-opt").next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
        if (self.selectedOpt.trim().length !== 0) {
            if ($(self.el).find(".text-opt").val().trim().length >= 1) {
                $(self.el).find(".text-opt").next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                self.continue = (self.continue === false ? false : true);
            } else {
                $(self.el).find(".text-opt").next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                self.continue = false;
            }
        } else if (self.selectedOpt.trim().length === 0) {
            if ($(self.el).find(".text-opt").val().trim().length === 0) {
                $(self.el).find(".text-opt").next().children().removeClass("fa-close color-red").removeClass("fa-check color-green");
                self.continue = (self.continue === false ? false : true);
            } else {
                $(self.el).find(".text-opt").next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                self.continue = false;
            }
        }
    },
    getValidOption: function() {
        var self = this;
        self.checkInput();
        return {
            optname: self.optName,
            valid: self.continue,
            select: self.selectedOpt.trim(),
            text: $(self.el).find(".text-opt").val().trim()
        };
    },
    init: function(opt, optselct, context) {
        var self = this;
        self.optName = opt;
        self.context = context;
        var numopt = self.optName.split("-");
        $(self.el).find(".num-option").html('<label> Select Option <span class="badge btn-default">' + numopt[numopt.length - 1] + '</span> : &nbsp; &nbsp;<span class="option-help" data-option-select="" data-html="true" data-toggle="tooltip"><b><i class="" aria-hidden="true"></i></b> </span></label>');
        $(self.el).find(".row").attr("data-option", self.optName);
        $(self.el).find(".select-opts-location").html(optselct);
        $(self.el).find('.selectpicker').selectpicker();
    },
    setOption: function(option, text) {
        var self = this;
        // console.log(option, text);
        $(self.el).find('.selectpicker').val(option);
        $(self.el).find('.selectpicker').selectpicker('render');
        $(self.el).find(".text-opt").val(text);
        self.selectedOpt = option;

        $(self.el).find(".option-help").children().addClass("fa fa-info-circle");
        $(self.el).find(".option-help").attr('data-original-title', "Click View Info <br> '" + self.selectedOpt + "'");
        $(self.el).find(".option-help").attr('data-option-select', self.selectedOpt);
        self.checkInput();
    },
    render: function() {
        var self = this;
        $(this.el).html(this.template());
        return this;
    }
});