window.TerminalView = Backbone.View.extend({
    terminal: undefined,
    socketTerm: null,
    events: {
    },
    initialize: function (skt) {
        this.socketTerm = skt.socket;
    },
    init: function () {
        var self = this;
        self.terminal = $('#cmdterminalID').terminal(function (command) {
            self.socketTerm.setcommand(command);
            self.socketTerm.setcommand('echo "`whoami`@`hostname`: [`pwd`] $ "');
        }, {
            history: true,
            greetings: 'Welcome to the web shell Nginx Config Tool',
            // prompt: 'echo "`whoami`@`hostname`: [`pwd`] $ "',
            exit: false
        });
        self.socketTerm.setcommand('echo "`whoami`@`hostname`: [`pwd`] $ "');
        $('#cmdterminalID').focus();
    },
    terminalstdout: function (data) {
        this.terminal.echo(String(data));
        this.terminal.set_prompt(data);

    },
    terminalstderr: function (data) {
        this.terminal.error(String(data));
    },
    terminaldisconnect: function () {
        this.terminal.disable();
    },
    terminalenable: function () {
        this.terminal.enable();
    },
    terminaldisable: function () {
        this.terminal.disable();
    },
    render: function () {
        $(this.el).html(this.template());
        return this;
    }
});