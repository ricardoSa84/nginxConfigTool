/* global Backbone, _, templateLoader, app */

Backbone.View.prototype.close = function() {
    this.remove();
    this.unbind();
    this.undelegateEvents();
};

// Configuracao das varias rotas de navegacao no site
var Router = Backbone.Router.extend({
    currentView: undefined,
    header: undefined,
    sidebar: undefined,
    contentheader: undefined,
    contentnav: undefined,
    content: undefined,
    footer: undefined,
    dashboardform: undefined,
    instanceServerSettings: undefined,
    editsettingsform: undefined,
    loginform: undefined,
    about: undefined,
    socketclt: null,
    terminalcmd: undefined,
    initialize: function() {
        var self = this;
        self.appEventBus = _.extend({}, Backbone.Events);
        self.socketclt = new socketClient({ vent: self.appEventBus });

        self.appEventBus.on('stdout', function(data) {
            if (window.profile && window.profile.get("Page") === "Terminal") {
                self.terminalcmd.terminalstdout(data);
            }
        });
        self.appEventBus.on('stderr', function(data) {
            if (window.profile && window.profile.get("Page") === "Terminal") {
                self.terminalcmd.terminalstderr(data);
            }
        });
        self.appEventBus.on('disconnect', function() {
            if (window.profile && window.profile.get("Page") === "Terminal") {
                self.terminalcmd.terminaldisconnect();
            }
        });
        self.appEventBus.on('enable', function() {
            if (window.profile && window.profile.get("Page") === "Terminal") {
                self.terminalcmd.terminalenable();
            }
        });
        self.appEventBus.on('disable', function() {
            if (window.profile && window.profile.get("Page") === "Terminal") {
                self.terminalcmd.terminaldisable();
            }
        });
        self.appEventBus.on('prompt', function(data) {
            if (window.profile && window.profile.get("Page") === "Terminal") {
                self.terminalcmd.terminalsetprompt(data);
            }
        });
    },
    showView: function(view, elem, sub) {
        elem.show();
        if (sub == false) {
            if (this.currentView) {
                this.currentView.close();
            }
            this.currentView = view;
            this.currentView.delegateEvents();
        }
        var rendered = view.render();
        elem.html(rendered.el);
    },
    // defenicao de navegacao nas rotas
    routes: {
        //Default Page
        "": "login",
        //Pagina Inicial
        "Inicio": "inicio",
        "Dashboard": "dashboard",
        "InstanceServer": "instanceServerSettings",
        "EditSettings": "editsettings",
        "Terminal": "cmdterminal",
        "About": "aCercaDe",
        '*notFound': 'login'
    },
    login: function() {
        this.currentView = undefined;
        this.header = undefined;
        this.sidebar = undefined;
        this.contentheader = undefined;
        this.contentnav = undefined;
        this.content = undefined;
        this.footer = undefined;
        this.loginform = undefined;
        this.dashboardform = undefined;
        // this.settingsform = undefined;
        this.editsettingsform = undefined,
            this.terminalcmd = undefined;
        if (this.socketclt) {
            this.socketclt.disconnect();
        }

        // linpa todo o conteudo das varias View da pagina web
        $('header').html("");
        $('#content').html("");
        $('aside.main-sidebar').html("");
        $('footer').html("");
        $('contentnav').html("");

        //elimina o conteudo do profile
        window.profile = null;
        window.sessionStorage.clear();
        window.logged = false;

        var self = this;
        self.loginform = new LoginView({});
        $('#content').html(self.loginform.render().el);
        self.loginform.checkloginstored();
    },
    aCercaDe: function() {
        var self = this;
        self.verificaLogin(function() {
            self.about = new AboutView();
            self.contentnav.setView("About");
            $('#content').html(self.about.render().el);
            window.profile.set("Page", undefined);
            // windowScrollTop();
        });
    },
    inicio: function() {
        var self = this;
        self.verificaLogin(function() {
            self.socketclt.connect();
            self.header = new HeaderView({
                logo: (window.profile.logo == "") ? "./img/user.png" : window.profile.logo
            });

            self.content = new InicioView();
            self.sidebar = new SideBarView({});
            self.footer = new FooterView();
            self.contentnav = new ContentNavView();

            $('header').html(self.header.render().el);
            self.header.init();

            $('#contentnav').html(self.contentnav.render().el);
            self.contentnav.setView("Inicio");

            $('#content').html(self.content.render().el);

            $('aside.main-sidebar').html(self.sidebar.render().el);

            $('footer').html(self.footer.render().el);
            window.profile.set("Page", undefined);
            self.footer.init();
        });
    },
    dashboard: function() {
        var self = this;
        self.verificaLogin(function() {
            self.dashboardform = new DashboardView({ socket: self.socketclt });
            $('#content').html(self.dashboardform.render().el);
            self.dashboardform.init();
            self.contentnav.setView("Dashboard");
            window.profile.set("Page", "Dashboard");
        });
    },
    instanceServerSettings: function() {
        var self = this;
        self.verificaLogin(function() {
            window.profile.set("Page", undefined);
            self.instanceServer = new InstanceServerView({});
            $('#content').html(self.instanceServer.render().el);
            self.instanceServer.init();
            self.contentnav.setView("Create / Edit Instance Server");
        });
    },
    editsettings: function() {
        var self = this;
        self.verificaLogin(function() {
            window.profile.set("Page", undefined);
            self.editsettingsform = new EditsettingsView({});
            $('#content').html(self.editsettingsform.render().el);
            self.editsettingsform.init();
            self.contentnav.setView("Create / Edit Server Settings");
        });
    },
    cmdterminal: function() {
        var self = this;
        self.verificaLogin(function() {
            self.terminalcmd = new TerminalView({ socket: self.socketclt });
            $('#content').html(self.terminalcmd.render().el);
            self.terminalcmd.init();
            self.contentnav.setView("Terminal");
            window.profile.set("Page", "Terminal");
        });
    },
    // verifica se o login e valido
    verificaLogin: function(loggedFunction) {
        var self = this;
        if (window.profile == undefined) {
            app.navigate('', {
                trigger: true
            });
        } else {
            if (!getKeyo()) {
                app.navigate('', {
                    trigger: true
                });
            } else {
                window.logged = true;
                loggedFunction();
            }
        }
    }
});

/**
 * Faz o load dos varios templates do BackBone
 * @param {type} param1
 * @param {type} param2
 */
templateLoader.load([
        "LoginView",
        "HeaderView",
        "InicioView",
        "SideBarView",
        "FooterView",
        "LocationView",
        "OptionView",
        "DashboardView",
        "SettingsView",
        "InstanceServerView",
        "EditsettingsView",
        "ContentNavView",
        "TerminalView",
        "AboutView"
    ],
    function() {
        app = new Router();
        Backbone.history.start();
    }
);
