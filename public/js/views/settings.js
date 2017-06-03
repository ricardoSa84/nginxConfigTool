/* global Backbone, normalizeString, app */
window.SettingsView = Backbone.View.extend({
  validinifile: false,
  inputchanged: false,
  continue: false,
  textOpt : "",
  events: {
    'keyup input': function () {
      this.checkImputs();
    },
    "change .selectpicker" : function () {
      var self = this;
      var opts = "";
      $(".selectpicker option:selected").each(function(index,element){
       // console.log(index);
       // console.log(element.value);
       // console.log(element.text);
       opts += element.text + "|";
     });
      self.textOpt = opts.slice(0,-1);
      self.checkImputs();
    },
    "click #save-settings": "savesettings",
    "change .btn-on-off" : function (evt){
      $(evt.target).parent().next().click();
    }
  },
  initialize: function () {
  },
  checkImputs: function () {
    var self = this;
    $('.valid-input').each(function (i, obj) {
      if ($(obj).val().trim().length <= 3) {
        $(obj).parent().parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
      } else {
        $(obj).parent().parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
      }
      switch ($(obj).data("typevalue")) {
        case "ipaddress":
        // var ipRegex = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
        var ipRegex = '^([01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5]).([01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5]).([01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5]).([01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])$';
        if ($(obj).val().trim().match(ipRegex)) {
          $(obj).parent().parent().parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
        } else {
          $(obj).parent().parent().parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
        }
        break;
        case "host-port":
        if (($(obj).val().trim() * 1) >= 1 && ($(obj).val().trim() * 1) < 65536) {
          $(obj).parent().parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
        } else {
          $(obj).parent().parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
        }
        break;
        case "host-name":
        var ipRegex = "^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$";
        // var ipRegex = "^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$";
        if ($(obj).val().trim().match(ipRegex) && $(obj).val().trim().length >= 3) {
          $(obj).parent().parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
        } else {
          $(obj).parent().parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
        }
        break;
      }
    });
    if (self.textOpt.trim().length > 0) {
      $("#select-extensao").parent().parent().parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
    } else {
      $("#select-extensao").parent().parent().parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
    }
  },
  init: function () {
    var self = this;
    $("#server-ip:input").inputmask();
    $('body').on('input', function (e) {
      self.inputchanged = true;
    });
    self.getiniconfigparams();
    showInfoMsg(false, '.my-modal');
    $.AdminLTE.boxWidget.activate();

    var options = "<optgroup label='Imagens'>";
    var extensionsimg = ["jpg", "gif", "jpeg", "png", "ico"];
    var extensionsdoc = ["pdf", "doc", "docx", "xls", "xlxs", "ppt", "pptx"];
    for (var i in extensionsimg.sort()) {
      options += "<option>" + extensionsimg[i] + "</option>";
    }
    options += "</optgroup><optgroup label='Documentos'>";
    for (var i in extensionsdoc.sort()) {
      options += "<option>" + extensionsdoc[i] + "</option>";
    }
    options += "</optgroup>";

    $("#select-extensao").html(options);    
    $('.selectpicker').selectpicker();



    
    $('#slider-cache').slider().on('slide', function(ev){
      $("#slider-cache-value").attr("data-sliderValue", this.value);
      $("#slider-cache-value").text(self.secondsTimeSpanToHMS(this.value));
    });

    $(".slider").css({
      width: "100%"
    });
    $("#slider-cache-value").parent().css({
      "margin-top": 0
    });

    $('#control-cache').bootstrapToggle();

    self.checkImputs();
  },
  secondsTimeSpanToHMS: function (s) {
    var h = Math.floor(s/3600); //Get whole hours
    s -= h*3600;
    var m = Math.floor(s/60); //Get remaining minutes
    s -= m*60;
    return h + "h " + (m < 10 ? '0'+ m : m) + "m " + (s < 10 ? '0'+ s : s) + "s"; //zero padding on minutes and seconds
  },
  getiniconfigparams: function () {
    var self = this;
    modem("GET",
      "/paramsinifile",
      function (data) {
        if (data.globalconfig != 0) {
          $("#site-file-folder").val(data.filemonitor);
          $("#ssh-port").val(data.sshport);
          $("#site-name").val(data.databasesitename.replace(/[^\w]/gi, ''));
          $("#site-pass").val(data.databasepass);
          $("#server-ip").val(data.databasehost);
          $("#server-port").val(data.databaseport);
          $("#sensor-local").val(data.localsensormorada);
          $("#sensor-name").val(data.localsensornomeSensor);
          $("#sensor-latitude").val(data.localsensorlatitude);
          $("#sensor-longitude").val(data.localsensorlongitude);
          $("#sensor-posx").val(data.localsensorposx);
          $("#sensor-posy").val(data.localsensorposy);
          if (atob(data.localsensorplant) != "none") {
            $('#plantlocalsensor').css({
              'border': "2px solid black",
              "-webkit-box-shadow": "none",
              "-moz-box-shadow": "none",
              "box-shadow": "none",
              "background-image": atob(data.localsensorplant),
              "background-size": "100% 100%",
              "background-repeat": "no-repeat",
              "background-position": "center center"
            });
          }
          $("#myonoffswitch").attr("checked", data.autostart);
          carregarmapa([["<h4>" + $("#sensor-name").val() + "</h4>", $("#sensor-latitude").val(), $("#sensor-longitude").val()]], $("#map-google")[0], self.selectnewposition);
          self.validinifile = true;
        } else {
          $("#Check-Position").click();
          self.validinifile = false;
        }
        self.checkImputs();
      },
      function (xhr, ajaxOptions, thrownError) {
        var json = JSON.parse(xhr.responseText);
        error_launch(json.message);
      }, {}
      );
  },
  savesettings: function (callback) {
    var self = this;
    if (($(".valid-input").length == $(".fa-check").length) ? true : false) {
      self.inputchanged = false;
      var settings = {
        filemonitor: $("#site-file-folder").val(),
        sshport: $("#ssh-port").val(),
        autostart: $("#myonoffswitch").is(":checked"),
        sitename: $("#site-name").val().replace(/[^\w]/gi, ''),
        host: $("#server-ip").val(),
        port: $("#server-port").val() * 1,
        password: $("#site-pass").val(),
        morada: $("#sensor-local").val(),
        nomeSensor: $("#sensor-name").val(),
        latitude: $("#sensor-latitude").val() * 1,
        longitude: $("#sensor-longitude").val() * 1,
        posx: $("#sensor-posx").val() * 1,
        posy: $("#sensor-posy").val() * 1,
        plant: btoa($("#plantlocalsensor").css("background-image"))
      };
      modem("POST",
        "/savesettings",
        function (data) {
          if (data == "save") {
            showmsg('.my-modal', "success", "Seved Settings!");
            self.validinifile = true;
            if (typeof callback == "function") {
              callback();
            }
          } else {
            showmsg('.my-modal', "error", "Error");
          }
        },
        function (xhr, ajaxOptions, thrownError) {
          var json = JSON.parse(xhr.responseText);
          error_launch(json.message);
        }, {
          data: settings
        }
        );
    } else {
      showmsg('.my-modal', "error", "Bad Values to Save, check the <i class='icon fa fa-close'>.");
    }
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
