window.LocationView = Backbone.View.extend({
  locationname: null,
  selectedOpts : "",
  optionsToDropdown : "",
  events: {
    "change .btn-on-off" : function (evt){   
      var self = this;
      console.log(evt.target);
      $(self.el).find(this).parent().next().click();
      // this.checkImputs();
    },
    "change .select-extensao.selectpicker" : function (evt) {
      var self = this;
      var opts = "";
      $(self.el).find(".select-extensao.selectpicker option:selected").each(function(index,element){
       // console.log(index);
       // console.log(element.value);
       // console.log(element.text);
       opts += element.text + "|";
     });
      self.selectedOpts = opts.slice(0,-1);
      // self.checkImputs();
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
      },
      function (xhr, ajaxOptions, thrownError) {
        var json = JSON.parse(xhr.responseText);
        error_launch(json.message);
      }, {});

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

    $(self.el).find('.btn-on-off').bootstrapToggle();

  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    $.AdminLTE.boxWidget.activate();
    return this;
  }
});
