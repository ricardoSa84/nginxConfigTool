// var SSH = require('simple-ssh');
var fs = require('fs');
var Client = require('ssh2').Client;

module.exports = {
    execRemoteCommand: function(content, res) {
        console.log("content", content);
        var conn = new Client();
        conn.on('ready', function() {
            console.log('Client :: ready');
            conn.exec('uptime', function(err, stream) {
                if (err) throw err;
                stream.on('close', function(code, signal) {
                    console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                    conn.end();
                }).on('data', function(data) {
                    console.log('STDOUT: ' + data);
                }).stderr.on('data', function(data) {
                    console.log('STDERR: ' + data);
                });
            });
        }).connect({
            host: '172.16.100.203',
            port: 22,
            username: 'oneadmin',
            privateKey: fs.readFileSync('/var/lib/one/.ssh/id_rsa')
        });

        // var ssh = new SSH({
        //     host: '172.16.100.203',
        //     user: 'oneadmin',
        //     key: fs.readFileSync('/var/lib/one/.ssh/id_rsa')
        // });
        // console.log(ssh);
        // console.log("content", content);
        // ssh.exec('pwd', {
        //         err: function(stderr) {
        //             console.log(stderr); // this-does-not-exist: command not found
        //         },
        //         out: function(stdout) {
        //             console.log(stdout);
        //         }
        //     })
        //     .exec('echo "Node.js"', {
        //         out: console.log.bind(console)
        //     })
        //     .exec('echo "is"', {
        //         out: console.log.bind(console)
        //     })
        //     .exec('echo "awesome!"', {
        //         out: console.log.bind(console)
        //     }).start();

        res.json({
            status: "OK",
            stdout: "result"
        });
    }
}