var SSH = require('simple-ssh');
var fs = require('fs');


module.exports = {
    execRemoteCommand: function(content, res) {
        var ssh = new SSH({
            host: '172.16.100.203',
            user: 'oneadmin',
            key: fs.readFileSync('/var/lib/one/.ssh/id_rsa')
        });
        console.log(ssh);
        console.log("content", content);
        ssh.exec('pwd', {
                err: function(stderr) {
                    console.log(stderr); // this-does-not-exist: command not found
                },
                out: function(stdout) {
                    console.log(stdout);
                }
            })
            .exec('echo "Node.js"', {
                out: console.log.bind(console)
            })
            .exec('echo "is"', {
                out: console.log.bind(console)
            })
            .exec('echo "awesome!"', {
                out: console.log.bind(console)
            }).start();

        res.json({
            status: "OK",
            stdout: "result"
        });
    }
}