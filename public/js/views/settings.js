/* global Backbone, normalizeString, app */
window.SettingsView = Backbone.View.extend({
  textRegex : /^\w+$/,
  portRegex : /^0*(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/,
  ipRegex : /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/,
  selectedOpts : "",
  events: {
    'keyup input': function () {
      this.checkImputs();
    },
    "change #select-extensao.selectpicker" : function (evt) {
      var self = this;
      var opts = "";
      $("#select-extensao.selectpicker option:selected").each(function(index,element){
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
    this.checkImputs();
  }
},
initialize: function () {
},
init: function () {
  var self = this;
  $("#server-ip:input").inputmask();
  $('body').on('input', function (e) {
  });
  showInfoMsg(false, '.my-modal');
  $.AdminLTE.boxWidget.activate();

  modem("GET",
    '/ext/all',
    function (data) {
      console.log(data);
      for (var i in data) {
        options += "<optgroup label='" + data[i].text + "'>";
        for (var j in data[i].ext.sort()) {
          options += "<option>" + data[i].ext[j] + "</option>";
        }
        options += "</optgroup>";
      }
      $("#select-extensao").html(options);    
      $('.selectpicker').selectpicker();
    },
    function (xhr, ajaxOptions, thrownError) {
      var json = JSON.parse(xhr.responseText);
      error_launch(json.message);
    }, {});

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
checkImputs: function () {
  var self = this;
  $('.valid-input').each(function (i, obj) {
    if ($(obj).val() && !$.isArray($(obj).val())) {
      $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
      switch ($(obj).data("typevalue")) {
        case "host-name":
        if ($(obj).val().trim().match(self.textRegex)) {
          $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
        } else {
          $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
        }
        break;
        case "host-port":
        if ($(obj).val().trim().match(self.portRegex)) {
          $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
        } else {
          $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
        }
        break;
        case "host-destination":
        var ipPort = $(obj).val().trim().split(":");
        if (ipPort[0].match(self.ipRegex) && ipPort[1].match(self.portRegex)) {
          $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
        } else {
          $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
        }
        break;
      }
    }
  });
  if ($("#control-cache").prop('checked')) {
    if (self.selectedOpts.trim().length > 0) {
      $("#select-extensao").parent().parent().parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
    } else {
      $("#select-extensao").parent().parent().parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
    }
  } else {
    $("#select-extensao").parent().parent().parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
  }
},

savesettings: function () {
  var self = this;
  if ((($(".valid-input").length - 1) == $(".fa-check").length) ? true : false) {
    console.log("OK");
    var params = {
      'SERVERNAME': $('#host-name').val(),
      'PORT': $('#host-port').val(),
      'PROXY': $('#host-destination').val(),
      'CACHE': $("#control-cache").prop('checked'),
      'CACHEFILES': self.selectedOpts,
      'TIMECACHE': $("#slider-cache-value").attr("data-sliderValue") + $("#select-cache-time.selectpicker option:selected").val()
    };

    var paramsobj = {
      proxy : {
        'SERVERNAME': $('#host-name').val(),
        'PORT': $('#host-port').val(),
        'PROXY': "http://" + $('#host-destination').val()  
      },
      cache : {
        'CACHE': $("#control-cache").prop('checked'),
        'PROXY': "http://" + $('#host-destination').val(),
        'CACHEFILES': self.selectedOpts,
        'TIMECACHE': $("#slider-cache-value").attr("data-sliderValue") + $("#select-cache-time.selectpicker option:selected").val()
      }
    }

    modem("POST",
      "/nginx/saveserver",
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
        data: paramsobj
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
