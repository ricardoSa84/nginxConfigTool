var fs = require('fs'),
    path = require('path'),
    node_ssh = require('node-ssh'),
    ssh = new node_ssh();

module.exports = {
    writeFileRemote: function(ipInstance, filename, filedest, result, res) {
        ssh.connect({
            host: ipInstance,
            username: 'root',
            privateKey: '/root/.ssh/id_rsa'
        }).then(function() {
            // Local, Remote
            ssh.putFile(filename, filedest).then(function() {
                console.log("The File thing is done");
                res.json({
                    status: "OK",
                    stdout: result
                });
            }, function(error) {
                console.log("Something's wrong");
                console.log(error.toString());
                res.json({
                    status: "ERROR",
                    stdout: error.toString()
                });
            });
        });
    },

    removeFileRemote: function(ipInstance, filename, res) {
        ssh.connect({
            host: ipInstance,
            username: 'root',
            privateKey: '/root/.ssh/id_rsa'
        }).then(function() {
            ssh.execCommand('rm -rf ' + filename).then(function(result) {
                console.log('STDOUT: ' + result.stdout);
                console.log('STDERR: ' + result.stderr);
                console.log(result);
                if (result.stdout) {
                    return res.json({
                        status: "OK",
                        stdout: result.stdout.toString()
                    });

                } else {
                    return res.json({
                        status: "ERROR",
                        stdout: result.stderr.toString()
                    });
                }
            });            
        });
    }
}