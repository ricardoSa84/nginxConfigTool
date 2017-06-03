/* global Backbone, normalizeString, app */
window.DashboardView = Backbone.View.extend({
  
  events: {
    
  },
  initialize: function () {
  },
  init: function () {
    
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
