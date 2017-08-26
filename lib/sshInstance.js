var fs = require('fs'),
    path = require('path'),
    node_ssh = require('node-ssh'),
    ssh = new node_ssh();

module.exports = {
    execRemoteCommand: function(content, res) {
        console.log("content", content);

        ssh.connect({
            host: '172.16.100.203',
            username: 'root',
            privateKey: fs.readFileSync('/var/lib/one/.ssh/id_rsa')
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
        res.json({
            status: "OK",
            stdout: "result"
        });
    }
}