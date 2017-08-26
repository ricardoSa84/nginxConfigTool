var SSH = require('simple-ssh');
var fs = require('fs');

var ssh = new SSH({
    host: '172.16.100.203',
    user: 'oneadmin',
    key: fs.readFileSync('/var/lib/one/.ssh/id_rsa')
});

module.exports = {
    execRemoteCommand: function() {
        ssh.exec('pwd', {
            err: function(stderr) {
                console.log(stderr); // this-does-not-exist: command not found
            },
            out: function(code) {{
            	console.log(code);
            }
        }).start();
    }
}