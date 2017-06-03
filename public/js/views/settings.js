/* global Backbone, normalizeString, app */
window.SettingsView = Backbone.View.extend({
  inputchanged: false,
  continue: false,
  selectedOpts : "",
  events: {
    'keyup input': function () {
      this.checkImputs();
    },
    "change #select-extensao" : function () {
      var self = this;
      var opts = "";
      $(".selectpicker option:selected").each(function(index,element){
       // console.log(index);
       // console.log(element.value);
       // console.log(element.text);
       opts += element.text + "|";
     });
      self.selectedOpts = opts.slice(0,-1);
      self.checkImputs();
    },
    "click #save-settings": "savesettings",
    "click #test-nginx": function(){
     modem("POST",
      '/nginx/test',
      function (data) {
        if (data.status === "nginx test ok") {
          $('#restart-nginx').prop('disabled', false);
          showmsg('.my-modal', "success", "NGinx Test OK!", true);
        } else {
          $('#restart-nginx').prop('disabled', true);
          showmsg('.my-modal', "error", data.stdout.replace(/\n/g, '<br>'), false);
        }
      },
      function (xhr, ajaxOptions, thrownError) {
        var json = JSON.parse(xhr.responseText);
        error_launch(json.message);
      }, {});
   },
   "click #restart-nginx": function(){
    console.log("SDFADFGAD");
    modem("POST",
      '/nginx/reload',
      function (data) {
        if (data.status === "nginx reload ok") {
          $('#restart-nginx').prop('disabled', false);
          showmsg('.my-modal', "success", "NGinx Test OK!", true);
        } else {
          $('#restart-nginx').prop('disabled', true);
          showmsg('.my-modal', "error", data.stdout.replace(/\n/g, '<br>'), false);
        }
      },
      function (xhr, ajaxOptions, thrownError) {
        var json = JSON.parse(xhr.responseText);
        error_launch(json.message);
      }, {});
  },
  "change .btn-on-off" : function (evt){
    $(evt.target).parent().next().click();
  }
},
initialize: function () {
},
checkImputs: function () {
  var self = this;
  $('.valid-input').each(function (i, obj) {
    if ($(obj).val() && !$.isArray($(obj).val())) {
      if ($(obj).val().trim().length <= 3) {
        $(obj).parent().parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
      } else {
        $(obj).parent().parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
      }
      switch ($(obj).data("typevalue")) {
        case "host-destination":
        var ipportRegex = "/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}\:[0-9]{1,3}$/.test(id)";
        if ($(obj).val().trim().match(ipportRegex)) {
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
        var hostRegex = "^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$";
        if ($(obj).val().trim().match(hostRegex) && $(obj).val().trim().length >= 3) {
          $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
        } else {
          $(obj).parent().parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
        }
        break;
      }
    }
  });
  if (self.selectedOpts.trim().length > 0) {
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
    $("#slider-cache-value").text((this.value));
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
  savesettings: function () {
    var self = this;
    if ((($(".valid-input").length - 1) == $(".fa-check").length) ? true : false) {
      self.inputchanged = false;
      var params = {
        'SERVERNAME': $('#host-name').val(),
        'PORT': $('#host-port').val(),
        'PROXY': $('#host-destination').val(),
        'CACHE': $("#control-cache").prop('checked'),
        'CACHEFILES': self.selectedOpts,
        'TIMECACHE': $("#slider-cache-value").attr("data-sliderValue") + $(".selectpicker option:selected").val()
      };

      modem("POST",
        "/saveserver",
        function (data) {
          if (data.status === "created") {
            $('#test-nginx').prop('disabled', false);
            showmsg('.my-modal', "success", "Seved Settings!", true);
          } else {
            $('#test-nginx').prop('disabled', true);
            showmsg('.my-modal', "error", "Error", true);
          }
        },
        function (xhr, ajaxOptions, thrownError) {
          var json = JSON.parse(xhr.responseText);
          error_launch(json.message);
        }, {
          data: params
        });
    } else {
      showmsg('.my-modal', "error", "Bad Values to Save, check the <i class='icon fa fa-close'>.", true);
    }
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
