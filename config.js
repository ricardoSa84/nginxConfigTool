var fs = require('fs'),
    cp = require('child_process');

module.exports = {
    mongodb: 'mongodb://127.0.0.1:27017/NginxTool',

    fileInstallerFull: './installers/installFull.sh',
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
        stationServer: 'http://' + cp.execSync("ifconfig br0 | grep 'UP' -A1 | tail -n1 | awk '{print $2}' | cut -f1  -d'/'").toString().replace(/[\n|\t]/g, ''),
        stationPort: 8080
    },

    defaultUser: {
        email: "admin@admin.pt",
        pass: "admin"
    }
}