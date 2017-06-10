/* global Backbone, normalizeString, app */
window.SettingsView = Backbone.View.extend({
    textRegex: /^\w+$/,
    portRegex: /^0*(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/,
    ipRegex: /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/,
    selectedOpts: "",
    countlocation: 0,
    allLocations: [],
    optionsList: [],
    optscount: 0,
    events: {
        'keyup input': function() {
            this.checkImputs();
        },
        "click .option-add": "addnewoptionserver",
        "click .option-remove-server": function(e) {
            var self = this;
            var optName = $(e.target).parent().parent().parent().parent().attr("data-option");
            $(e.target).parent().parent().parent().parent().parent().remove();
            self.optionsList[optName] = null;
        },
        "click #save-settings": "savesettings",
        "click #test-nginx": function() {
            modem("POST",
                '/nginx/test',
                function(data) {
                    if (data.status === "nginx test ok") {
                        $('#restart-nginx').prop('disabled', false);
                        showmsg('.my-modal', "success", "NGinx Test OK!", true);
                    } else {
                        $('#restart-nginx').prop('disabled', true);
                        showmsg('.my-modal', "error", data.stdout.replace(/\n/g, '<br>'), false);
                    }
                },
                function(xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                }, {});
        },
        "click #restart-nginx": function() {
            modem("POST",
                '/nginx/reload',
                function(data) {
                    if (data.status === "nginx reload ok") {
                        $('#restart-nginx').prop('disabled', false);
                        showmsg('.my-modal', "success", "NGinx Test OK!", true);
                    } else {
                        $('#restart-nginx').prop('disabled', true);
                        showmsg('.my-modal', "error", data.stdout.replace(/\n/g, '<br>'), false);
                    }
                },
                function(xhr, ajaxOptions, thrownError) {
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
        "click #add-new-location": function() {
            var self = this;
            this.locationView = new LocationView({ model: this.model });
            $(this.el).find("#server-locations").append(this.locationView.render().el);
            this.locationView.init("location-" + self.countlocation);

            self.allLocations["location-" + self.countlocation] = self.locationView;
            self.countlocation++;
        }
    },
    initialize: function() {

    },
    addnewoptionserver: function(e) {
        var self = this;
        $(e.target).removeClass("fa-plus-circle").addClass("fa-minus-circle");
        $(e.target).parent().removeClass("option-add").addClass("option-remove-server");
        $(e.target).parent().attr('data-original-title', "Remove row.");

        this.optionView = new OptionView({ model: this.model });
        $(this.el).find(".option-list-server").append(this.optionView.render().el);
        this.optionView.init("option-" + self.optscount, /*self.allListOptions*/ );
        self.optionsList["option-" + self.optscount] = self.optionView;
        self.optscount++;
    },
    init: function() {
        var self = this;
        $("#server-ip:input").inputmask();
        $('body').on('input', function(e) {});
        showInfoMsg(false, '.my-modal');
        $.AdminLTE.boxWidget.activate();


        this.optionView = new OptionView({ model: this.model });
        $(this.el).find(".option-list-server").append(this.optionView.render().el);
        this.optionView.init("option-" + self.optscount, /*self.allListOptions*/ );
        self.optionsList["option-" + self.optscount] = self.optionView;
        self.optscount++;


        self.checkImputs();
    },
    checkImputs: function() {
        var self = this;
        // $(self.el).find('.valid-input').each(function (i, obj) {
        //   if ($(self.el).find(obj).val() && !$.isArray($(obj).val())) {
        //   console.log($(self.el).find(obj).data("typevalue"));
        //     $(self.el).find(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
        //     switch ($(self.el).find(obj).data("typevalue")) {
        //       case "host-name":
        //       if ($(self.el).find(obj).val().trim().match(self.textRegex)) {
        //         $(self.el).find(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
        //       } else {
        //         $(self.el).find(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
        //       }
        //       break;
        //       case "host-port":
        //       if ($(self.el).find(obj).val().trim().match(self.portRegex)) {
        //         $(self.el).find(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
        //       } else {
        //         $(self.el).find(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
        //       }
        //       break;
        //       case "host-destination":
        //       var ipPort = $(self.el).find(obj).val().trim().split(":");
        //       if (ipPort[0].match(self.ipRegex) && ipPort[1].match(self.portRegex)) {
        //         $(self.el).find(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
        //       } else {
        //         $(self.el).find(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
        //       }
        //       break;
        //     }
        //   }
        // });
        // if ($(self.el).find(".control-cache-ext").prop('checked')) {
        //   if (self.selectedOpts.trim().length > 0) {
        //     $(self.el).find(".select-extensao").parent().parent().parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
        //   } else {
        //     $(self.el).find(".select-extensao").parent().parent().parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
        //   }
        // } else {
        //   $(self.el).find(".select-extensao").parent().parent().parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
        // }
    },
    savesettings: function() {
        var self = this;

        for (var i in self.allLocations) {
            console.log(self.allLocations[i].getLocationJson());
        }

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
