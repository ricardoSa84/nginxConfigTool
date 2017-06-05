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
    var cachestr = "";
    if (options.cache.CACHE === 'true') {
      cachestr = "\n\tlocation ~* ^.+\.(?:" + options.cache.CACHEFILES + ")$ {\n" + 
      "\t\texpires " + options.cache.TIMECACHE + ";\n\n" +
      "\t\tinclude /etc/nginx/dashboard/cache.conf;\n\n" +
      "\t\tproxy_pass " + options.cache.PROXY + ";\n\t}\n";
    }
    content = content.replace("[CACHESTATICFILES]", cachestr.toString('utf8'));

    return content;
  }
};