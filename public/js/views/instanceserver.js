/* global Backbone, normalizeString, app */
window.InstanceServerView = Backbone.View.extend({
    instancecontinue: false,
    templateNum: null,
    templateName: "",
    selectedInstance: null,
    editmode: false,
    events: {
        "keyup .instance-name": "checkInputs",
        "change .select-template :input": function(e) {
            this.templateNum = $(e.target).val();
            this.templateName = $(e.target).next().text();
            this.checkInputs();
        },
        "click .instance-action": function(e) {
            var self = this;
            var aacionBtn = $(event.target).closest('button').attr("data-action");
            modem("GET",
                '/vm/' + aacionBtn + 'Instance/' + self.selectedInstance._id,
                function(data) {
                    // console.log(data);
                    if (data.status === "OK") {
                        showmsg('.my-modal', "success", data.stdout, true);
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
    getInstaceContinue: function() {
        var self = this;
        self.checkInputs();
        return {
            continue: self.instancecontinue,
            newInstance: {
                instanceName: $(self.el).find(".instance-name").val().trim(),
                templateNum: self.templateNum,
                templateName: self.templateName,
                templateCPU: $(self.el).find(".slider-cpu-size-value").text().trim(),
                templateRam: $(self.el).find(".slider-ram-size-value").text().split(" ")[0]
            }
        };
    },
    initialize: function(skt) {},
    init: function(editmode, instancesel) {
        var self = this;
        self.editmode = editmode;
        self.selectedInstance = instancesel;
        $("#server-ip:input").inputmask();
        $('body').on('input', function(e) {});
        // showInfoMsg(false, '.my-modal');
        $.AdminLTE.boxWidget.activate();
        $('.selectpicker').selectpicker('refresh');

        modem("GET",
            '/vm/getListTemplate',
            function(data) {
                var optTemplates = "";
                for (var i in data.templates) {
                    if (data.templates[i].name.toString().toLowerCase().indexOf("arch") >= 0) {
                        optTemplates += '<label class="btn btn-default"><img src="./img/logos/arch.png" class="img-rounded" /><br><input name="Template" value="' + data.templates[i].id.toString() + '" type="radio"><b>' + data.templates[i].name.toString() + '</b></label>';
                    } else if (data.templates[i].name.toString().toLowerCase().indexOf("centos") >= 0) {
                        optTemplates += '<label class="btn btn-default"><img src="./img/logos/centos.png" class="img-rounded" /><br><input name="Template" value="' + data.templates[i].id.toString() + '" type="radio"><b>' + data.templates[i].name.toString() + '</b></label>';
                    } else if (data.templates[i].name.toString().toLowerCase().indexOf("debian") >= 0) {
                        optTemplates += '<label class="btn btn-default"><img src="./img/logos/debian.png" class="img-rounded" /><br><input name="Template" value="' + data.templates[i].id.toString() + '" type="radio"><b>' + data.templates[i].name.toString() + '</b></label>';
                    } else if (data.templates[i].name.toString().toLowerCase().indexOf("fedora") >= 0) {
                        optTemplates += '<label class="btn btn-default"><img src="./img/logos/fedora.png" class="img-rounded" /><br><input name="Template" value="' + data.templates[i].id.toString() + '" type="radio"><b>' + data.templates[i].name.toString() + '</b></label>';
                    } else if (data.templates[i].name.toString().toLowerCase().indexOf("redhat") >= 0) {
                        optTemplates += '<label class="btn btn-default"><img src="./img/logos/redhat.png" class="img-rounded" /><br><input name="Template" value="' + data.templates[i].id.toString() + '" type="radio"><b>' + data.templates[i].name.toString() + '</b></label>';
                    } else if (data.templates[i].name.toString().toLowerCase().indexOf("ubuntu") >= 0) {
                        optTemplates += '<label class="btn btn-default"><img src="./img/logos/ubuntu.png" class="img-rounded" /><br><input name="Template" value="' + data.templates[i].id.toString() + '" type="radio"><b>' + data.templates[i].name.toString() + '</b></label>';
                    } else if (data.templates[i].name.toString().toLowerCase().indexOf("windows8") >= 0) {
                        optTemplates += '<label class="btn btn-default"><img src="./img/logos/windows8.png" class="img-rounded" /><br><input name="Template" value="' + data.templates[i].id.toString() + '" type="radio"><b>' + data.templates[i].name.toString() + '</b></label>';
                    } else if (data.templates[i].name.toString().toLowerCase().indexOf("windowsxp") >= 0) {
                        optTemplates += '<label class="btn btn-default"><img src="./img/logos/windowsxp.png" class="img-rounded" /><br><input name="Template" value="' + data.templates[i].id.toString() + '" type="radio"><b>' + data.templates[i].name.toString() + '</b></label>';
                    } else {
                        optTemplates += '<label class="btn btn-default"><img src="./img/logos/linux.png" class="img-rounded" /><br><input name="Template" value="' + data.templates[i].id.toString() + '" type="radio"><b>' + data.templates[i].name.toString() + '</b></label>';
                    }
                }
                $(".select-template").html(optTemplates);
                $(".select-template").parent().css({
                    height: $(".select-template").height() * ($(".select-template").height() < 100 ? 2.60 : 1.10)
                });

                if (instancesel) {
                    self.addOptInstance(self.selectedInstance);

                    modem("GET",
                        '/vm/statusInstance/' + self.selectedInstance._id,
                        function(data) {
                            console.log(data);
                            if (data.status === "OK") {
                                showmsg('.my-modal', "success", function() {
                                    var ht = "";
                                    $.each(data.stdout, function(k, v) {
                                        $.each(v, function(key, value) {
                                            console.log("T- ", key + ": " + value);
                                            ht += '<p>' + key + ": " + value + '</p><br>';
                                        });
                                    });
                                    return ht;
                                }(), false);
                            } else {
                                showmsg('.my-modal', "error", data.stdout, false);
                            }
                        },
                        function(xhr, ajaxOptions, thrownError) {
                            var json = JSON.parse(xhr.responseText);
                            error_launch(json.message);
                        }, {});

                } else {
                    $('.my-modal').hide();
                    $('.my-modal').html("");
                }

                if (self.editmode) {
                    $(self.el).find(".instance-btn").html('' +
                        '<div class="col-md-2"><button type="button" class="btn btn-default btn-block"><label><i class="fa fa-plus" aria-hidden="true"></i> Resize Instance </label></button></div>' +
                        '<div class="col-md-2"><button type="button" class="btn btn-default btn-block  instance-delete"><label><i class="fa fa-trash" aria-hidden="true"></i> Delete Instance </label></button></div>' +
                        '<div class="col-md-2"><button type="button" data-action="start" class="btn btn-default btn-block  instance-action"><label><i class="fa fa-play" aria-hidden="true"></i> Start Instance </label></button></div>' +
                        '<div class="col-md-2"><button type="button" data-action="stop" class="btn btn-default btn-block  instance-action"><label><i class="fa fa-stop" aria-hidden="true"></i> Stop Instance </label></button></div>' +
                        '<div class="col-md-2"><button type="button" data-action="pause" class="btn btn-default btn-block  instance-action"><label><i class="fa fa-pause" aria-hidden="true"></i> Pause Instance </label></button></div>' +
                        '<div class="col-md-2"><button type="button" data-action="restart" class="btn btn-default btn-block  instance-action"><label><i class="fa fa-refresh" aria-hidden="true"></i> Restart Instance </label></button></div>');
                } else {
                    $(self.el).find(".instance-btn").html('<div class="col-md-2"><button type="button " class="btn btn-default btn-block create-instance"><label>Create Instance</label></button></div>');
                }
            },
            function(xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
            }, {});

        $(self.el).find('.slider-cpu-size, .slider-ram-size').slider().on('slide', function(ev) {
            $(self.el).find("." + $(ev.target).data("slideid") + "-value").text((Math.floor(this.value * 100) / 100) + ($(ev.target).data("slideid") === 'slider-ram-size' ? " Gb" : ""));
        });

        $(self.el).find(".slider").css({ width: "100%" });
        $(self.el).find('.slider-cpu-size, .slider-ram-size').parent().css({ "margin-top": 0 });
    },
    checkInputs: function() {
        var self = this;
        self.instancecontinue = true;
        $(self.el).find('.valid-input').each(function(i, obj) {
            if ($(self.el).find(obj)) {
                $(self.el).find(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                switch ($(self.el).find(obj).data("typevalue")) {
                    case "instance-name":
                        if ($(self.el).find(obj).val().trim().length >= 3) {
                            $(self.el).find(obj).next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                            self.instancecontinue = (self.instancecontinue === false ? false : true);
                        } else {
                            $(self.el).find(obj).next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                            self.instancecontinue = false;
                        }
                        break;
                }
            }
        });
        if (self.templateNum && self.templateName.trim().length > 0) {
            $(self.el).find(".select-template").parent().next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
            self.instancecontinue = (self.instancecontinue === false ? false : true);
        } else {
            $(self.el).find(".select-template").parent().next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
            self.instancecontinue = false;
        }
    },
    addOptInstance: function(instanceselected) {
        var self = this;
        $(self.el).find(".instance-name").val(instanceselected.instanceName);

        $(self.el).find('.select-template :input[value="' + instanceselected.templateNum + '"]').click();

        $(self.el).find(".slider-cpu-size-value").text(instanceselected.templateCPU);
        $(self.el).find(".slider-cpu-size").slider('setValue', instanceselected.templateCPU);

        $(self.el).find(".slider-ram-size-value").text(instanceselected.templateRam);
        $(self.el).find(".slider-ram-size").slider('setValue', instanceselected.templateRam);

        self.checkInputs();
        $('.my-modal').hide();
        $('.my-modal').html("");
    },
    render: function() {
        var self = this;
        $(this.el).html(this.template());
        return this;
    }
});