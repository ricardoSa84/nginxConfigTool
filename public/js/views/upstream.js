'use strict';
window.UpstreamView = Backbone.View.extend({
    textRegex: /^\w+$/,
    upstreamSel: null,
    instanceId: "",
    allOptionupstream: [],
    countoptionupstream: 1,
    allListOptionsUpstream: "",
    upstreamContinue: false,
    editModeUpstream: false,
    events: {
        'keyup input': function() {
            this.checkImputs();
        },
        "click .option-upstream-remove": function(e) {
            var self = this;
            var optName = $(e.target).parent().parent().parent().parent().attr("data-option");
            $(e.target).parent().parent().parent().parent().parent().remove();
            self.allOptionupstream[optName] = null;
        },
        "click .option-add": "addnewoption",
        "click .test-nginx": function() {
            this.testeNginx(null);
        },
        "click .restart-nginx": function() {
            var self = this;
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
                }, {
                    data: self.instanceId
                });
            });
        },
    },
    initialize: function() {},
    init: function(upstreamData, instanceSel, editMode) {
        var self = this;
        if (upstreamData) {
            self.upstreamSel = null;
            self.instanceId = "";
            self.allOptionupstream = [];
            self.countoptionupstream = 1;
            self.allListOptionsUpstream = "";
            self.upstreamContinue = false;
            self.editModeUpstream = false;
        }
        self.upstreamSel = upstreamData;
        self.instanceId = instanceSel;
        self.editModeUpstream = editMode;

        modem("GET", '/options/upstream', function(data) {
            var options = "<option></option>";
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    options += "<option>" + data[i].directive + "</option>";
                }
            }
            self.allListOptionsUpstream = options;

            var optionView = new OptionView({});
            $(self.el).find(".option-list-upstream").append(optionView.render().el);
            optionView.init("upstream-option-" + self.countoptionupstream, self.allListOptionsUpstream, "upstream");
            self.allOptionupstream["upstream-option-" + self.countoptionupstream] = optionView;
            self.countoptionupstream++;

            $(self.el).find('.selectpicker').selectpicker('refresh');

            if (self.upstreamSel) {
                self.createLastUpstream(self.upstreamSel);
            } else {
                hideMsg('.my-modal-wait');
            }
        }, function(xhr, ajaxOptions, thrownError) {
            var json = JSON.parse(xhr.responseText);
            error_launch(json.message);
        }, {});

        if (!self.editModeUpstream) {
            $(".upstream-btns").html('<div class="col-md-2 "><button type="button" class="btn btn-default upstream-create btn-block"><label><i class="fa fa-save"></i> Create Upstream </label></button></div>');
        } else {
            $(".upstream-btns").html('<div class="col-md-2 "><button type="button" class="btn btn-default upstream-create btn-block"><label><i class="fa fa-save"></i> Save Upstream </label></button></div>' +
                '<div class="col-md-2"><button type="button " class="btn btn-default btn-block remove-upstream"><label><i class="fa fa-trash-o"></i> Remove Upstream</label></button></div>' +
                '<div class="col-md-2 "><button type="button " class="btn btn-default btn-block test-nginx"><label> Test Nginx </label></button></div>' +
                '<div class="col-md-2 "><button type="button" class="btn btn-default btn-block restart-nginx"><label><i class="fa fa-refresh "></i></i> Restart Ngnix</label></button></div>');
        }
    },
    addnewoption: function(e) {
        var self = this;
        if (e) {
            $(self.el).find(e.target).removeClass("fa-plus-circle").addClass("fa-minus-circle");
            $(self.el).find(e.target).parent().attr('data-original-title', "Remove row.");
        }
        var optionView = new OptionView({});
        $(self.el).find(".option-list-upstream").append(optionView.render().el);
        $(self.el).find(e.target).parent().removeClass("option-add").addClass("option-upstream-remove");
        optionView.init("upstream-option-" + self.countoptionupstream, self.allListOptionsUpstream, "upstream");
        self.allOptionupstream["upstream-option-" + self.countoptionupstream] = optionView;
        self.countoptionupstream++;
    },
    checkImputs: function() {
        var self = this;
        self.upstreamContinue = true;
        $(self.el).find('.valid-input').each(function(i, obj) {
            if ($(self.el).find(obj)) {
                $(self.el).find(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                switch ($(self.el).find(obj).data("typevalue")) {
                    case "upstream-name":
                        if ($(self.el).find(obj).val().trim().match(self.textRegex) && $(self.el).find(obj).val().trim().length >= 3) {
                            $(self.el).find(obj).next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                            self.locationcontinue = (self.locationcontinue === false ? false : true);
                        } else {
                            $(self.el).find(obj).next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                            self.locationcontinue = false;
                        }
                        break;
                }
            }
        });
    },
    getUpstreamJson: function() {
        var self = this;
        var auxOptionName = "";
        var upsJson = {};
        self.checkImputs();
        upsJson = {
            instanceid: self.instanceId,
            editMode: self.editModeUpstream,
            name: $(self.el).find('.upstream-name').val().trim(),
            options: []
        }
        for (var i in self.allOptionupstream) {
            if (i.indexOf("upstream") != -1) {
                if (self.allOptionupstream[i]) {
                    var obj = self.allOptionupstream[i].getValidOption();
                    if (obj.valid) {
                        if (obj.text != '') {
                            upsJson.options.push(obj);
                        }
                    } else {
                        auxOptionName = obj.optname;
                        self.upstreamContinue = false;
                    }
                }
            }
        }
        if (!self.upstreamContinue) {
            showmsg('.my-modal', "error", "Bad Values to Save, check the <b>x</b>. " + capitalizeFirstAndReplaceArrow(auxOptionName) + "<br>", false);
            upsJson = null;
        } else if (self.upstreamContinue && upsJson.options.length === 0) {
            showmsg('.my-modal', "error", "Insert options in this upsteam.", false);
            upsJson = null;
        }
        return upsJson;
    },
    createLastUpstream: function(upstream) {
        var self = this;
        $(self.el).find('.upstream-name').val(upstream[0].name);
        $(self.el).find('.upstream-name').attr("disabled", "disabled");
        for (var i = 0; i < upstream[0].options.length; i++) {
            self.allOptionupstream["upstream-option-" + (self.countoptionupstream - 1)].setOption(upstream[0].options[i].select, upstream[0].options[i].text);
            if (i !== upstream[0].options.length - 1) {
                $(self.el).find(".option-list-upstream .option-add .fa").click();
            }
        }
        self.checkImputs();
        hideMsg('.my-modal-wait');
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
        }, {
            data: self.instanceId
        });
    },
    render: function() {
        var self = this;
        $(self.el).html(self.template());
        return self;
    }
});