var fs = require('fs');

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
      console.log(keyscache)

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