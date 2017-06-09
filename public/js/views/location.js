window.LocationView = Backbone.View.extend({
  newrowhtml : '<div class="row with-border"><div class="col-md-2"><label>Select Option:</label></div><div class="col-md-3"><div class="form-group"><select class="select-opt-1 selectpicker form-control valid-input" multiple data-live-search="true" title="Select extensions to Cache."  data-actions-box="true"></select></div></div><div class="col-md-5"><input class="text-opt-1 width100 vcenter valid-input form-control" data-typevalue="location-option" type="text" placeholder="" value="" data-mask=""></div><div class="col-md-1"><span class="whith10p color-red" data-toggle="tooltip" title=""> <i class="icon fa fa-close"></i></span></div><div class="col-md-1"><h4><span class="option-add whith10p" data-toggle="tooltip" title="Add new row."><i class="fa fa-plus-circle"></i></span></h4></div></div>',
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
    "click .option-add" : function (e){
      var self = this;
      $(e.target).removeClass("fa-plus-circle").addClass("fa-minus-circle");
      $(e.target).parent().removeClass("option-add").addClass("option-remove");
      $(e.target).parent().attr('data-original-title', "Remove row.");
      $(self.el).find(".option-list").append(self.newrowhtml); 
      $(self.el).find('.selectpicker').selectpicker();
    },
    "click .option-remove" : function(e){
      $(e.target).parent().parent().parent().parent().remove();
    },
    "change .btn-on-off" : function (evt){   
      var self = this;
      if ((!$(self.el).find(".control-cache-ext").prop('checked') && !$(self.el).find(".control-cache-path").prop('checked')) || (!$(self.el).find(".control-cache-ext").prop('checked') && $(self.el).find(".control-cache-path").prop('checked')) || ($(self.el).find(".control-cache-ext").prop('checked') && !$(self.el).find(".control-cache-path").prop('checked'))) {

        if ($(self.el).find(evt.target).prop('checked') && $(self.el).find(evt.target).parent().parent().parent().parent().hasClass( "collapsed-box" )){
          $(self.el).find(evt.target).parent().next().click();
        }
        if (!$(self.el).find(evt.target).prop('checked') && !$(self.el).find(evt.target).parent().parent().parent().parent().hasClass( "collapsed-box" )){
          $(self.el).find(evt.target).parent().next().click();
        }
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

        if ($(self.el).find(".control-cache-ext").prop('checked')) {
          $(self.el).find(".control-cache-path").bootstrapToggle('disable');

        } else if (!$(self.el).find(".control-cache-ext").prop('checked')) {
          $(self.el).find(".control-cache-path").bootstrapToggle('enable');
        }

        if ($(self.el).find(".control-cache-path").prop('checked')) {
          $(self.el).find(".control-cache-ext").bootstrapToggle('disable');

        } else if (!$(self.el).find(".control-cache-path").prop('checked')) {
          $(self.el).find(".control-cache-ext").bootstrapToggle('enable');
        }

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
  getLocationJson : function (){
    var self = this;

    var objJson = "Teste -> " + self.locationname;
    return objJson;
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

