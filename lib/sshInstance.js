var fs = require('fs'),
    path = require('path'),
    node_ssh = require('node-ssh'),
    ssh = new node_ssh();

module.exports = {
    execRemoteCommand: function(content, res) {
        console.log("content", content);

        ssh.connect({
            host: '192.168.1.119',
            username: 'root',
            privateKey: '/root/.ssh/id_rsa'
        })

        ssh.execCommand('hh_client --json', { cwd: '/var/www' }).then(function(result) {
            console.log('STDOUT: ' + result.stdout)
            console.log('STDERR: ' + result.stderr)
            console.log(result);
        });

        ssh.exec('hh_client', ['--json'], {
            cwd: '/var/www',
            stream: 'stdout',
            options: { pty: true }
        }).then(function(result) {
            console.log('STDOUT: ' + result)
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