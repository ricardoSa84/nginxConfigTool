var fs = require('fs'),
    OpenNebula = require('opennebula'),
    cp = require("child_process"),
    sendRemote = require('./sshInstance.js'),
    Instance = require('./models/instance.js'),
    niveis = ["", "\t", "\t\t", "\t\t\t"],
    dir = './tmp';

Instance = new Instance();


/**
 * function for single or multiple options (directive value pairs) processing
 * @param  {[type]} options array of options with the folowing properties:
 * select: for directive
 * text: for inputed text
 * @return {[type]}         returns formated lines for nginx config file
 */
function optionsToFormatedString(options) {
    // console.log("options:", options);
    var toReturn = '';
    if (options) {
        for (var i = 0; i < options.length; i++) {
            toReturn += options[i].select + '\t' + options[i].text + ";";
            toReturn += i == options.length - 1 ? '' : '\n\t\t';
        }
    }
    return toReturn;
};

function optionsToFormatedString2(nivel, options) {
    nivel = nivel || 1;
    var content = fs.readFileSync('./templates/props.conf').toString('utf8');
    var toReturn = '';
    if (options) {
        for (var i = 0; i < options.length; i++) {
            var propups = content;
            propups = propups.replace("[ATTR]", options[i].select);
            propups = propups.replace("[PROP]", options[i].text);
            toReturn += niveis[nivel] + propups + "\n";
        }
    }
    return toReturn;
};

function setAndSaveUpstreeams(upsteams, serverName, port) {
    var content = fs.readFileSync('./templates/upstreams.conf').toString('utf8');
    var props = optionsToFormatedString(upsteams.options);

    content = content.replace("[UPSTREAMNAME]", upsteams.name);
    content = content.replace("[PROPS]", props);

    fs.writeFile('/etc/nginx/conf.d/0000-' + serverName + "-" + port + '-upstreams.conf',
        content,
        function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log('upstreams guadadas');
            }

        });
};

function getStaticInfo(obj, serverName, port) {
    var toReturn = {};
    // console.log('staticObj:', obj);
    if (obj.staicCacheExtentions != undefined) {
        toReturn.locationName = ' ~*.(' + obj.staicCacheExtentions.locpath + ')$';
        toReturn.timeCahe = optionsToFormatedString2(2, [{ select: 'expires', text: obj.staicCacheExtentions.timecache }]);
        // } else if (obj.upstreams != undefined) {
        //     setAndSaveUpstreeams(obj.upstreams, serverName, port);
        //     toReturn.upstreamName = obj.upstreams.name;
    } else if (obj.staicCachePath != undefined) {
        toReturn.locationName = (obj.staicCachePath.initLocPath == "" ? '' : obj.staicCachePath.initLocPath +
            (obj.staicCachePath.initLocPath.lastIndexOf('/') == obj.staicCachePath.initLocPath.length - 1 ? '' : '/')) + '~^/(' + obj.staicCachePath.locpath + ')/';
        toReturn.timeCahe = optionsToFormatedString2(2, [{ select: 'expires', text: obj.staicCachePath.timecache }]);
    }
    return toReturn;
};

function setAndSaveLocations(locArray, serverName, port, defaultLoc) {
    var totalLocations = '';
    var defaultcontent = fs.readFileSync('./templates/location.conf').toString('utf8');
    defaultcontent = defaultcontent.replace("[LOCATIONNAME]", defaultLoc.path);
    defaultcontent = defaultcontent.replace("[TIMECACHE]", optionsToFormatedString2(2, [{ select: 'proxy_pass', text: defaultLoc.proxy }]));
    defaultcontent = defaultcontent.replace("[PROPS]", optionsToFormatedString2(2, defaultLoc.options));
    defaultcontent = defaultcontent.replace("[INCLUDECACHEFILE]", '');

    var templateDoc = fs.readFileSync('./templates/location.conf').toString('utf8');
    if (locArray) {
        for (var i = 0; i < locArray.length; i++) {
            var content = templateDoc;
            var props = optionsToFormatedString2(2, locArray[i].options);
            var staticInfo = getStaticInfo(locArray[i], serverName, port);
            // if (Object.keys(staticInfo).length > 0 && staticInfo.upstreamName != undefined) {
            //     props += '\n proxy_pass \t\t ' + staticInfo.upstreamName + ';\n';
            //     delete staticInfo.upstreamName;
            // }
            content = content.replace("[LOCATIONNAME]", Object.keys(staticInfo).length > 0 ? staticInfo.locationName : locArray[i].locationPath);
            content = content.replace("[INCLUDECACHEFILE]", Object.keys(staticInfo).length > 0 ? 'include /etc/nginx/dashboard/cache.conf;' : '');
            content = content.replace("[TIMECACHE]", Object.keys(staticInfo).length > 0 ? staticInfo.timeCahe : '');
            content = content.replace("[PROPS]", props);
            totalLocations += '\n' + content;
        }
    }
    totalLocations += '\n' + defaultcontent;
    return totalLocations;
};

module.exports = {
    prepareConf: function(template, options) {
        var content = fs.readFileSync('./templates/' + template + '.conf').toString('utf8');

        var keys = Object.keys(options.proxy);

        for (var i = 0; i < keys.length; i++) {
            var key = '[' + keys[i] + ']';
            while (content.indexOf(key) >= 0) {
                content = content.replace(key, options.proxy[keys[i]]);
            }
        }

        // Validacao da utilizacao de cache para conteudos estaticos.
        var contentCache = "";
        if (options.cache.CACHE === 'true') {
            contentCache = fs.readFileSync('./templates/cachestaticfiles.conf').toString('utf8');

            var keyscache = Object.keys(options.cache);

            for (var i in keyscache) {
                var keycache = '[' + keyscache[i] + ']';
                while (contentCache.indexOf(keycache) >= 0) {
                    contentCache = contentCache.replace(keycache, options.cache[keyscache[i]]);
                }
            }
        }
        content = content.replace("[CACHESTATICFILES]", contentCache);

        return content;
    },
    processReceivedJson: function(ipInstance, json, result, local, res) {
        var contentLoc = setAndSaveLocations(json.locations, json.servername, json.port, json.defaultLocation);

        //console.log(json);

        var content = fs.readFileSync('./templates/server.conf').toString('utf8');
        content = content.replace("[PORT]", json.port);
        content = content.replace("[SERVERNAME]", json.servername);
        content = content.replace("[PROPS]", "\n\n" + optionsToFormatedString2(1, json.serveropts) + "\n" + contentLoc);


        try {
            if (local === "local") {
                saveFile(ipInstance, '/etc/nginx/conf.d/1000-' + json.servername + '-' + json.port + '.conf', "", content, "Server", local, result, res);

            } else if (local === "remote") {

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                
                saveFile(ipInstance, './temp/' + (new Date().getTime()) + '-' + json.servername + '-' + json.port + '.conf', '/etc/nginx/conf.d/1000-' + json.servername + '-' + json.port + '.conf', content, "Server", local, result, res);

            } else {
                return res.json({
                    status: "ERROR",
                    stdout: "ERROR"
                });
            }
        } catch (e) {
            console.log("Error", e.toString());
            return res.json({
                status: "ERROR",
                stdout: "ERROR"
            });
        }
    },

    processReceivedJsonUpstream: function(ipInstance, upsteams, result, local, res) {
        var content = fs.readFileSync('./templates/upstreams.conf').toString('utf8');
        var props = optionsToFormatedString2(1, upsteams.options);

        content = content.replace("[UPSTREAMNAME]", upsteams.name);
        content = content.replace("[PROPS]", props);

        try {
            if (local === "local") {

                saveFile(ipInstance, '/etc/nginx/conf.d/0000-' + upsteams.name + '-upstreams.conf', "", content, "Upstream", local, result, res);

            } else if (local === "remote") {

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }

                saveFile(ipInstance, './temp/' + (new Date().getTime()) + '-' + upsteams.name + '-upstreams.conf', '/etc/nginx/conf.d/0000-' + upsteams.name + '-upstreams.conf', content, "Upstream", local, result, res);

            } else {
                return res.json({
                    status: "ERROR",
                    stdout: "ERROR"
                });
            }
        } catch (e) {
            console.log("Error", e.toString());
            return res.json({
                status: "ERROR",
                stdout: "ERROR"
            });
        }
    },
    removeFiles: function(ip, filename, res) {
        try {
            sendRemote.removeFileRemote(ip, filename, res);
        } catch (e) {
            console.log("Error", e.toString());
        }
    }
};

var saveFile = function(ip, fileNameLocal, fileNameRemote, content, TipeObj, local, result, res) {
    fs.writeFile(fileNameLocal, content, function(err) {
        if (err) {
            console.log(err);
            return res.json({
                status: "ERROR",
                stdout: err.toString()
            });
        } else {
            if (local === "local") {
                console.log("Local " + TipeObj + ' Saved.');
                res.json({
                    status: "OK",
                    stdout: result
                });
            } else if (local === "remote") {
                console.log('Instance Remote, ' + TipeObj + ' Saved.');
                sendRemote.writeFileRemote(ip, fileNameLocal, fileNameRemote, result, res);
            } else {
                return res.json({
                    status: "ERROR",
                    stdout: "ERROR"
                });
            }
        }
    });
}