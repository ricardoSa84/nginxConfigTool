window.LocationView = Backbone.View.extend({
  textRegex : /^\w+$/,
  portRegex : /^0*(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/,
  ipRegex : /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/,
  locationname: null,
  selectedOpts : "",
  optionsToDropdown : "",
  lastHeight : -1,
  events: {
    'keyup input': function () {
      this.checkImputs();
    },
    "change .btn-on-off" : function (evt){   
      var self = this;
      $(self.el).find(evt.target).parent().next().click();

      if ($(self.el).find(".control-cache-ext").prop('checked') || $(self.el).find(".control-cache-path").prop('checked')) {
        if (self.lastHeight !== 0) {
          self.lastHeight = $(self.el).find(".location-path").height();
        }
        $(self.el).find(".location-path").animate({
          "height" : 0
        }, 500);
        $(self.el).find(".location-input").parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
      } 
      if (!$(self.el).find(".control-cache-ext").prop('checked') && !$(self.el).find(".control-cache-path").prop('checked')) {
        $(self.el).find(".location-path").animate({
          "height" : self.lastHeight
        }, 500);
        $(self.el).find(".location-input").parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
      }

      this.checkImputs();
    },
    "change .select-extensao.selectpicker" : function (evt) {
      var self = this;
      var opts = "";
      $(self.el).find(".select-extensao.selectpicker option:selected").each(function(index,element){
       opts += element.text + "|";
     });
      self.selectedOpts = opts.slice(0,-1);
      self.checkImputs();
    },
  },
  initialize: function () {    
    var self = this;

    modem("GET",
      '/ext/all',
      function (data) {
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
      function (xhr, ajaxOptions, thrownError) {
        var json = JSON.parse(xhr.responseText);
        error_launch(json.message);
      }, {});

  },
  checkImputs : function(){
    var self = this;
    $(self.el).find('.valid-input').each(function (i, obj) {

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
  init : function (name){
    var self = this;
    self.locationname = name;
    $(self.el).find(".well").attr("data-location", self.locationname);

    $(self.el).find('.slider-cache-ext, .slider-cache-path').slider().on('slide', function(ev){
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
  render: function () {
    var self = this;
    $(self.el).html(self.template());
    return self;
  }
});
