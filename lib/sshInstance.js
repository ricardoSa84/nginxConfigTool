var fs = require('fs'),
    SSH = require('simple-ssh');

module.exports = {
    execRemoteCommand: function(content, res) {
        console.log("content", content);

        var ssh = new SSH({
            host: '192.168.1.119',
            user: 'root',
            key: fs.readFileSync('/root/.ssh/id_rsa')
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