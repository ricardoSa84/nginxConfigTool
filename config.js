var fs = require('fs');

module.exports = {
    mongodb: 'mongodb://127.0.0.1:27017/NginxTool',

    fileInstallerFull : './installers/installFull.sh',
    fileIntallerCollector: './installers/installCollector.sh',
    sshKeyUser: '/var/lib/one/.ssh/id_rsa.pub',
    sshKeyRoot: '/root/.ssh/id_rsa.pub',

    openNebulaparams: {
        one: {
            host: 'http://127.0.0.1:2633/RPC2',
            auth: (fs.readFileSync('/var/lib/one/.one/one_auth').toString('utf8').trim() || 'oneadmin:oneadmin'),
            network: 'private',
            sunstone: 'http://127.0.0.1'
        }
    },

    serverHttpParams: {
        porthttp: 3000,
        stationServer: 'http://127.0.0.1',
        stationPort: 8080
    },

    defaultUser : {
        email: "admin@admin.pt",
        pass: "admin"
    }
} 