/* global Backbone, normalizeString, app */
window.EditInstanceServerView = Backbone.View.extend({
    instanceselected: "",
    allInstances: [],
    instance: null,
    events: {
        "change .select-instance.selectpicker": function(e) {
            var self = this;
            var opt = "";
            $(self.el).find(".select-instance.selectpicker option:selected").each(function(index, element) {
                opt += element.value;
            });
            displayWait('.my-modal-wait');
            self.instanceselected = opt;
            self.instance = null;
            if (self.instanceselected === "newinstance") {
                $(self.el).find(".instance-server").children().remove();
                var instanceServer = new InstanceServerView({});
                $(self.el).find(".instance-server").html(instanceServer.render().el);
                instanceServer.init(false, null);
                self.instance = instanceServer;
            } else {
                $(self.el).find(".instance-server").children().remove();
                var instanceServer = new InstanceServerView({});
                $(self.el).find(".instance-server").html(instanceServer.render().el);
                instanceServer.init(true, self.allInstances[self.instanceselected]);
                self.instance = instanceServer;
            }
        },
        "click .create-instance": function() {
            var self = this;
            var instanceData = self.instance.getInstaceContinue();
            if (instanceData.continue) {
                modem("POST",
                    '/vm/createInstance',
                    function(data) {
                        // console.log(data);
                        if (data.status === "OK") {
                            showmsg('.my-modal', "success", data.stdout, true);
                            self.selectInstancePopulate(instanceData.newInstance.instanceName);
                        } else {
                            showmsg('.my-modal', "error", data.stdout, false);
                        }

                    },
                    function(xhr, ajaxOptions, thrownError) {
                        var json = JSON.parse(xhr.responseText);
                        error_launch(json.message);
                    }, {
                        data: instanceData.newInstance
                    });

            } else {
                showmsg('.my-modal', "error", "Bad Values to create instance, check the <b>x</b>. ", false);
            }
        },
        "click .instance-delete": function() {
            var self = this;
            modem("DELETE",
                '/vm/deleteInstance/' + self.allInstances[self.instanceselected]._id,
                function(data) {
                    // console.log(data);
                    if (data.status === "OK") {
                        showmsg('.my-modal', "success", data.stdout, true);
                        $(self.el).find(".instance-server").html("<img class='center-block' alt='' src='./img/Nginx-Logo.png' style='width: 15%; height: auto'>" +
                            "<h1 class='text-center' style='text-shadow: -4px 4px hsla(0, 0%, 70%, .4),-3px 3px hsla(0, 0%, 60%, .2), -2px 2px hsla(0, 0%, 70%, .2), -1px 1px hsla(0, 0%, 70%, .2), 0px 0px hsla(0, 0%, 50%, .5), 1px -1px hsla(0, 0%, 30%, .6), 2px -2px hsla(0, 0%, 30%, .7), 3px -3px hsla(0, 0%, 32%, .8), 4px -4px hsla(0, 0%, 30%, .9), 5px -5px hsla(0, 0%, 30%, 1.0); font-family: 'Permanent Marker', cursive;'>Edit Server Settings</h1>" +
                            "<hr class='soften' />");
                        $(self.el).find(".select-instance.selectpicker").find('[value=' + self.allInstances[self.instanceselected]._id + ']').remove();
                        $(self.el).find(".select-instance.selectpicker").selectpicker('refresh');
                    } else {
                        showmsg('.my-modal', "error", data.stdout, false);
                    }

                },
                function(xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                }, {});
        },
        "click .saveresize": function() {
            var self = this;
            var instanceData = self.instance.getInstaceContinue();
            if (instanceData.continue) {
                modem("POST",
                    '/vm/resizeInstance',
                    function(data) {
                        console.log(data);
                        if (data.status === "OK") {
                            showmsg('.my-modal', "success", data.stdout, true);
                            self.selectInstancePopulate(instanceData.newInstance.instanceName);
                        } else {
                            showmsg('.my-modal', "error", data.stdout, false);
                        }
                    },
                    function(xhr, ajaxOptions, thrownError) {
                        var json = JSON.parse(xhr.responseText);
                        error_launch(json.message);
                    }, {
                        data: instanceData
                    });
            }
        }
    },
    initialize: function(skt) {},
    init: function() {
        var self = this;
        $("#server-ip:input").inputmask();
        $('body').on('input', function(e) {});
        showInfoMsg(false, '.my-modal');
        $.AdminLTE.boxWidget.activate();
        $('.selectpicker').selectpicker('refresh');
        self.selectInstancePopulate(null);
    },
    selectInstancePopulate: function(sel) {
        var self = this;
        modem("GET",
            '/vm/allInstances',
            function(data) {
                // console.log(data);
                if (data.status === "OK") {
                    self.allInstances = data;
                    var opts = "";
                    for (var i in data.stdout) {
                        opts += "<option value='" + data.stdout[i]._id + "'> Name - " + data.stdout[i].instanceName + " / Template - " + data.stdout[i].templateName + "</option>";
                        self.allInstances[data.stdout[i]._id] = data.stdout[i];
                    }
                    opts += "<option value='newinstance'>Create New Instance</option>";

                    $(".select-instance.selectpicker").html(opts);
                    $('.select-instance.selectpicker').selectpicker('refresh');
                    if (sel) {
                        for (var i in self.allInstances) {
                            if (sel === self.allInstances[i].instanceName) {
                                $('.select-instance.selectpicker').val(self.allInstances[i]._id);
                                $('.select-instance.selectpicker').selectpicker('render');
                                $('.select-instance.selectpicker').val(self.allInstances[i]._id).change();
                                $(".instace-new-created").attr("data-instanceName", "");
                                return;
                            }
                        }
                    }
                }
            },
            function(xhr, ajaxOptions, thrownError) {
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