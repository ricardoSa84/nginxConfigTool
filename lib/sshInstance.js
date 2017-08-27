var fs = require('fs'),
    path = require('path'),
    node_ssh = require('node-ssh'),
    ssh = new node_ssh();

module.exports = {
    writeFileRemote: function(filename, filedest, res) {
        console.log("content", content);


        ssh.connect({
            host: '192.168.1.119',
            username: 'root',
            privateKey: '/root/.ssh/id_rsa'
        }).then(function() {
            // Local, Remote
            ssh.putFile(filename, filedest).then(function() {
                console.log("The File thing is done")
            }, function(error) {
                console.log("Something's wrong")
                console.log(error)
            })

            // Array<Shape('local' => string, 'remote' => string)>
            // ssh.putFiles([{ local: '/home/steel/Lab/localPath', remote: '/home/steel/Lab/remotePath' }]).then(function() {
            //     console.log("The File thing is done")
            // }, function(error) {
            //     console.log("Something's wrong")
            //     console.log(error)
            // })

            // Local, Remote
            // ssh.getFile('/home/steel/Lab/localPath', '/home/steel/Lab/remotePath').then(function(Contents) {
            //     console.log("The File's contents were successfully downloaded")
            // }, function(error) {
            //     console.log("Something's wrong")
            //     console.log(error)
            // })

            // Putting entire directories
            // const failed = []
            // const successful = []
            // ssh.putDirectory('/home/steel/Lab', '/home/steel/Lab', {
            //     recursive: true,
            //     validate: function(itemPath) {
            //         const baseName = path.basename(itemPath)
            //         return baseName.substr(0, 1) !== '.' && // do not allow dot files
            //             baseName !== 'node_modules' // do not allow node_modules
            //     },
            //     tick: function(localPath, remotePath, error) {
            //         if (error) {
            //             failed.push(localPath)
            //         } else {
            //             successful.push(localPath)
            //         }
            //     }
            // }).then(function(status) {
            //     console.log('the directory transfer was', status ? 'successful' : 'unsuccessful')
            //     console.log('failed transfers', failed.join(', '))
            //     console.log('successful transfers', successful.join(', '))
            // })

            // Command
            // ssh.execCommand('echo ' + (content) + " > " + filename, { cwd: '/var/www' }).then(function(result) {
            //     console.log('STDOUT: ' + result.stdout)
            //     console.log('STDERR: ' + result.stderr)
            // })
            // Command with escaped params
            // ssh.exec('hh_client', ['--json'], { cwd: '/var/www', stream: 'stdout', options: { pty: true } }).then(function(result) {
            //     console.log('STDOUT: ' + result)
            // })
        })


        res.json({
            status: "OK",
            stdout: "result"
        });
    }
}