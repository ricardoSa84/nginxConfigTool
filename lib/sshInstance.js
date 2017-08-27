var fs = require('fs'),
    SSH = require('simple-ssh');

module.exports = {
    execRemoteCommand: function(content, filename, res) {
        console.log("content", content);

        var ssh = new SSH({
            host: '192.168.1.119',
            user: 'root',
            key: fs.readFileSync('/root/.ssh/id_rsa')
        });
        console.log("content", content);
        ssh.exec('echo ' + content + " > " + filename, {
            err: function(stderr) {
                console.log("Error", stderr); // this-does-not-exist: command not found
            },
            out: function(stdout) {
                console.log("OK", stdout);
            }
        }).start();

        res.json({
            status: "OK",
            stdout: "result"
        });
    }
}