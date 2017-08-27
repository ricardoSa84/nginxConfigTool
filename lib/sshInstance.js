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
                return res.json({
                    status: "OK",
                    stdout: result
                });
            }, function(error) {
                console.log("Something's wrong");
                console.log(error.toString());
                return res.json({
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
                // console.log("Result", result);
                if (result.stdout.length >= 0) {
                    // console.log('STDOUT: ' + result.stdout);
                    return res.json({
                        status: "OK",
                        stdout: "This upstream removed. " + result.stdout.toString()
                    });

                } else {
                    console.log('STDERR: ' + result.stderr);
                    return res.json({
                        status: "ERROR",
                        stdout: result.stderr.toString()
                    });
                }
            });
        });
    },

    execCommandRemote: function(ipInstance, command, res) {
        ssh.connect({
            host: ipInstance,
            username: 'root',
            privateKey: '/root/.ssh/id_rsa'
        }).then(function() {
            ssh.execCommand(command).then(function(output) {
                if (output.stderr.toString().indexOf("ignored") > -1 && output.stderr.toString().indexOf("syntax is ok") > -1 && output.stderr.toString().indexOf("test is successful") > -1) {
                    res.send({
                        'status': 'nginx test warning',
                        'stdout': output.stderr
                    });
                } else if (output.stderr.toString().indexOf("syntax is ok") > -1 && output.stderr.toString().indexOf("test is successful") > -1) {
                    res.send({
                        'status': 'nginx test ok',
                        'stdout': output.stderr
                    });
                } else if (output.stderr.toString().indexOf("[warn]") > -1) {
                    res.send({
                        'status': 'nginx test ok',
                        'stdout': output.stderr
                    });
                } else {
                    res.send({
                        'status': 'nginx test fail',
                        'stdout': output.stderr
                    });
                }

            });
        });
    }
}