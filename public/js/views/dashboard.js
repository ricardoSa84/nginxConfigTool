/* global Backbone, normalizeString, app */
window.DashboardView = Backbone.View.extend({
  socketDash : null,
  events: {

  },
  initialize: function (skt) {
    this.socketDash = skt.socket;
  },
  init: function () {
  },
  dashboardstdaccess: function (data) {
    console.log("access - " + data);
  },
  dashboardstderror : function (data){
    console.log("error - " + data);
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
