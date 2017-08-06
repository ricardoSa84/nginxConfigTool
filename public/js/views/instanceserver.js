/* global Backbone, normalizeString, app */
window.InstanceServerView = Backbone.View.extend({

  events: {
    
  },
  initialize: function (skt) {
  },
  init: function () {
    var self = this;

   

  },
  
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
