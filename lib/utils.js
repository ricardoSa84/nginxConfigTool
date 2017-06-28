var fs = require('fs');

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

function setAndSaveUpstreeams(upsteams) {
    var content = fs.readFileSync('./templates/upsteams.conf').toString('utf8');
    var props = optionsToFormatedString(upsteams.options);

    content = content.replace("[UPSTREAMNAME]", upsteams.name);
    content = content.replace("[PROPS]", props);

    fs.writeFile('/etc/nginx/conf.d/0000-' + upsteams.name + '.conf',
        content,
        function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log('upstreams guadadas');
            }

        });

};

function getStaticInfo(obj) {
    var toReturn = {};
    if (obj.staicCacheExtentions != undefined && obj.staicCacheExtentions.length > 0) {
        toReturn.locationName = ' ~* .(' + obj.staicCacheExtentions.locpath + ')$';
        toReturn.timeCahe = 'expires \t' + obj.staicCacheExtentions.timecache + ';\n';
    } else if (obj.upstreams != undefined && obj.upstreams.length > 0) {
        setAndSaveUpstreeams(obj.upstreams);
        toReturn.locationName = obj.upstreams.name;
        toReturn.timeCahe = '';
    } else if (obj.staicCachePath != undefined && obj.staicCachePath.length > 0) {
        toReturn.locationName = obj.staicCachePath.initLocPath + '~ ^/(' + obj.staicCachePath.locpath + ')/';
        toReturn.timeCahe = 'expires \t' + obj.staicCachePath.timecache + ';\n';
    }
    return toReturn;
};

function setAndSaveLocations(locArray, serverName, defaultLoc) {
    var totalLocations = '';
    var defaultcontent = fs.readFileSync('./templates/location.conf').toString('utf8');
    defaultcontent = defaultcontent.replace("[LOCATIONNAME]", defaultLoc.path);
    defaultcontent = defaultcontent.replace("[TIMECACHE]", '\n\t\t proxy_pass\t' + defaultLoc.proxy + ';\n');
    defaultcontent = defaultcontent.replace("[PROPS]", optionsToFormatedString(defaultLoc.options));

    var templateDoc = fs.readFileSync('./templates/location.conf').toString('utf8');
    if (locArray) {
        for (var i = 0; i < locArray.length; i++) {
            var content = templateDoc;
            var props = optionsToFormatedString(locArray[i].options);
            var staticInfo = getStaticInfo(locArray[i]);
            content = content.replace("[LOCATIONNAME]", Object.keys(staticInfo).length > 0 ? staticInfo.locname : locArray[i].locationPath);
            // console.log('LENGHT:', staticInfo);
            content = content.replace("[TIMECACHE]", Object.keys(staticInfo).length > 0 ? staticInfo.timeCahe : '');
            content = content.replace("[PROPS]", props);
            totalLocations += '\n' + content;
        }
    }
    totalLocations += '\n' + defaultcontent;
     console.log(totalLocations);
     fs.writeFile('/etc/nginx/conf.d/1000-' + serverName + '-locations.conf',
         totalLocations,
         function(err) {
             if (err) {
                 console.log(err);
             } else {
                 console.log('locations guadadas');
             }

         });
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
    }
};

module.exports = {
    processReceivedJson: function(json /*, res*/ ) {
        var contentLoc = setAndSaveLocations(json.locations, json.servername, json.defaultLocation);

        console.log(json);

        var content = fs.readFileSync('./templates/server.conf').toString('utf8');
        content = content.replace("[PORT]", json.port);
        content = content.replace("[SERVERNAME]", json.servername);
        content = content.replace("[PROPS]", "\n\n\t\t" + optionsToFormatedString(json.serveropts) + "\n" + contentLoc);
        content = content.replace("[LOCATIONSERVERNAME]",json.servername);

        fs.writeFile('/etc/nginx/conf.d/2000-' + json.servername + '.conf',
            content,
            function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('server guadado');
                }

            });


        // res.send({
        //     'status': 'created'
        // });
    }
};
