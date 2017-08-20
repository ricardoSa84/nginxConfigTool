var fs = require('fs');
var OpenNebula = require('opennebula');
var cp = require("child_process");
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

function setAndSaveUpstreeams(upsteams,serverName,port) {
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

function getStaticInfo(obj,serverName,port) {
    var toReturn = {};
    console.log('staticObj:',obj);
    if (obj.staicCacheExtentions != undefined) {
        toReturn.locationName = ' ~*.(' + obj.staicCacheExtentions.locpath + ')$';
        toReturn.timeCahe = 'expires \t' + obj.staicCacheExtentions.timecache + ';\n';
    } else if (obj.upstreams != undefined) {
        setAndSaveUpstreeams(obj.upstreams,serverName,port);
        toReturn.upstreamName = obj.upstreams.name;
    } else if (obj.staicCachePath != undefined) {
        toReturn.locationName = (obj.staicCachePath.initLocPath == "" ? '':obj.staicCachePath.initLocPath +
        (obj.staicCachePath.initLocPath.lastIndexOf('/') == obj.staicCachePath.initLocPath.length-1 ? '' : '/')) + '~^/(' + obj.staicCachePath.locpath + ')/';
        toReturn.timeCahe = 'expires \t\t' + obj.staicCachePath.timecache + ';\n';
    }
    return toReturn;
};

function setAndSaveLocations(locArray, serverName,port, defaultLoc) {
    var totalLocations = '';
    var defaultcontent = fs.readFileSync('./templates/location.conf').toString('utf8');
    defaultcontent = defaultcontent.replace("[LOCATIONNAME]", defaultLoc.path);
    defaultcontent = defaultcontent.replace("[TIMECACHE]", '\n\t\t proxy_pass\t' + defaultLoc.proxy + ';\n');
    defaultcontent = defaultcontent.replace("[PROPS]", optionsToFormatedString(defaultLoc.options));
    defaultcontent = defaultcontent.replace("[INCLUDECACHEFILE]",'');

    var templateDoc = fs.readFileSync('./templates/location.conf').toString('utf8');
    if (locArray) {
        for (var i = 0; i < locArray.length; i++) {
            var content = templateDoc;
            var props = optionsToFormatedString(locArray[i].options);
            var staticInfo = getStaticInfo(locArray[i],serverName,port);
            if(Object.keys(staticInfo).length > 0 && staticInfo.upstreamName!=undefined){
              props += '\n proxy_pass \t\t ' + 'http://'+staticInfo.upstreamName + ';\n';
              delete staticInfo.upstreamName;
            }
            content = content.replace("[LOCATIONNAME]", Object.keys(staticInfo).length > 0 ? staticInfo.locationName : locArray[i].locationPath);
            content = content.replace("[INCLUDECACHEFILE]", Object.keys(staticInfo).length > 0 ? 'include /etc/nginx/dashboard/cache.conf;' : '');
            content = content.replace("[TIMECACHE]", Object.keys(staticInfo).length > 0 ? staticInfo.timeCahe : '');
            content = content.replace("[PROPS]", props);
            totalLocations += '\n' + content;
        }
    }
    totalLocations += '\n' + defaultcontent;
    // console.log(totalLocations);
    // fs.writeFile('/etc/nginx/conf.d/1000-' + serverName + '-locations.conf',
    //     totalLocations,
    //     function(err) {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log('locations guadadas');
    //         }

    //     });
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
    processReceivedJson: function(json) {
        var contentLoc = setAndSaveLocations(json.locations, json.servername,json.port, json.defaultLocation);

        //console.log(json);

        var content = fs.readFileSync('./templates/server.conf').toString('utf8');
        content = content.replace("[PORT]", json.port);
        content = content.replace("[SERVERNAME]", json.servername);
        content = content.replace("[PROPS]", "\n\n\t\t" + optionsToFormatedString(json.serveropts) + "\n" + contentLoc);

        fs.writeFile('/etc/nginx/conf.d/1000-' + json.servername + '-' + json.port +'.conf',
            content,
            function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('locations guadadas');
                }

            });


        // res.send({
        //     'status': 'created'
        // });
    },
};
