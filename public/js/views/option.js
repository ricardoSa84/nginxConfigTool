'use strict';
window.OptionView = Backbone.View.extend({
    optName: "",
    selectedOpt: "",
    continue: false,
    events: {
        "keyup .text-opt": function() {
            this.checkImput();
        },
        "change .select-opts-location": function() {
            var self = this;
            var opt = "";
            $(self.el).find(".select-opts-location option:selected").each(function(index, element) {
                opt = element.text;
            });
            self.selectedOpt = opt;
            self.checkImput();
        }
    },
    initialize: function() {

    },
    checkImput: function() {
        var self = this;
        $(self.el).find(".text-opt").next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
        if (self.selectedOpt.trim().length !== 0) {
            if ($(self.el).find(".text-opt").val().trim().length >= 1) {
                $(self.el).find(".text-opt").next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                self.continue = true;
            } else {
                $(self.el).find(".text-opt").next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                self.continue = false;
            }
        } else if (self.selectedOpt.trim().length === 0) {
            if ($(self.el).find(".text-opt").val().trim().length === 0) {
                $(self.el).find(".text-opt").next().children().removeClass("fa-close color-red").removeClass("fa-check color-green");
                self.continue = true;
            } else {
                $(self.el).find(".text-opt").next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                self.continue = false;
            }
        }
    },
    getValidOption: function() {
        var self = this;
        self.checkImput();
        console.log(self.optName, self.continue, self.selectedOpt.trim().length, $(self.el).find(".text-opt").val().trim().length);
        return {
            optname: self.optName,
            valid: self.continue,
            select: self.selectedOpt.trim(),
            text: $(self.el).find(".text-opt").val().trim()
        };
    },
    init: function(opt, optselct) {
        var self = this;
        self.optName = opt;
        var numopt = self.optName.split("-");
        $(self.el).find(".num-option").html('<label><span class="badge">' + numopt[numopt.length -1] + '</span> Select Option:</label>');
        $(self.el).find(".row").attr("data-option", self.optName);
        $(self.el).find(".select-opts-location").html(optselct);
        $('.selectpicker').selectpicker();
    },
    render: function() {
        var self = this;
        $(this.el).html(this.template());
        return this;
    }
});
