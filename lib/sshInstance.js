var fs = require('fs'),
    path = require('path'),
    node_ssh = require('node-ssh'),
    ssh = new node_ssh();

module.exports = {
    writeFileRemote: function(filename, filedest, result, res) {
    	var ipRemote = result;
        ssh.connect({
            host: '192.168.1.119',
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
    }
}