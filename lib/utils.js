var fs = require('fs');

function optionsToFormatedString(options){
  var toReturn = '';
  for(var i = 0; i < options.length; i++){
    toReturn += options.select + '\t' + options.text;
    toReturn += i == options.length-1 ? '' : '\n';
  }
  return toReturn;
};

function setAndSaveUpstreeams(upsteams){
  var content = fs.readFileSync('./templates/upsteams.conf').toString('utf8');
  var props = optionsToFormatedString(upsteams.options);

  content.replace('[UPSTREAMNAME]',upsteams.name);
  content.replace('[PROPS]',props);

  fs.writeFile('/etc/nginx/conf.d/0000-' + upsteams.name + '.conf',
      content, function(err) {
          if (err) {
            console.log(err);
        }

    });

};

function getStaticInfo(obj){
  var toReturn = {};
  if(obj.staicCacheExtentions.length>0){
    toReturn.locationName = ' ~* .(' + obj.staicCacheExtentions.locpath + ')$';
    toReturn.timeCahe = 'expires \t' + obj.staicCacheExtentions.timecache + ';\n';
  }else if(obj.upstreams.length > 0){
    setAndSaveUpstreeams(obj.upstreams);
    toReturn.locationName = obj.upstreams.name;
    toReturn.timeCahe = '';
  }else{
    toReturn.locationName = obj.staicCacheExtentions.initLocPath + '~ ^/(' + obj.staicCacheExtentions.locpath + ')/';
    toReturn.timeCahe = 'expires \t' + obj.staicCacheExtentions.timecache + ';\n';
  }
  return toReturn;
};

function setAndSaveLocations(locArray,serverName){
  var content = fs.readFileSync('./templates/upsteams.conf').toString('utf8');
  for(var loc in locArray){
      var props = optionsToFormatedString(loc.options);
      var staticInfo = getStaticInfo(loc);
      content.replace('[LOCATIONNAME]',staticInfo.length > 0 ? staticInfo.locationName:loc.locationPath);
      content.replace('[TIMECACHE]',staticInfo.timeCahe);
      content.replace('[PROPS]',props);

      fs.writeFile('/etc/nginx/conf.d/1000-' + serverName + '-' + loc.locname + '.conf',
          content, function(err) {
              if (err) {
                console.log(err);
            }

        });
  }

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
  processReceivedJson: function(json,res){
    console.log(json);
    res.send({
             'status': 'created'
         });
  }
};
