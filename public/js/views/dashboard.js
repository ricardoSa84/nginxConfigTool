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
    // console.log("access - " + data);
    $("#access-log").css({
      "overflow": "scroll"
    });
    $("#access-log").append("<p>" + data + "</p>");
    $("#access-log").scrollTop($("#access-log")[0].scrollHeight);
  },
  dashboardstderror : function (data){
    // console.log("error - " + data);
    $("#error-log").css({
      "overflow": "scroll"
    });
    $("#error-log").append("<p>" + data + "</p>");
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
