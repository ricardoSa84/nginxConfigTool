var dbconn = require('./models/connectDB.js'),
    User = require('./models/user'),
    Ext = require('./models/ext.js'),
    OptionSelect = require('./models/optionselect.js'),
    OptionInfo = require('./models/OptionSelectInfo.js'),
    config = require('./../config.js'),
    md5 = require('md5'),
    btoa = require('btoa'),
    request = require('request'),
    cheerio = require("cheerio"),
    hreklink = [],
    sigleDiretive = [],
    allFullDiretives = [],
    url = 'http://nginx.org/en/docs',
    count = 0;

User = new User();
Ext = new Ext();
OptionSelect = new OptionSelect();
OptionInfo = new OptionInfo();

module.exports = {
    checkStartPopulateDb: function() {
        this.addDefaultUser();
        this.InsertAllExt(null, null);
        this.checkOptionsInserted(null, null);
    },

    addDefaultUser: function() {
        User.InsertUser({
            email: config.defaultUser.email,
            pass: md5(btoa(config.defaultUser.pass))
        }, null, null);
    },

    InsertAllExt: function(req, res) {
        Ext.getCountExt(function() {
            Ext.InsertExtMulti({
                type: "ext",
                text: "Imagens",
                ext: ["jpg", "gif", "jpe?g", "png", "ico", "cur", "woff"]
            }, {
                type: "ext",
                text: "Documentos",
                ext: ["pdf", "doc", "docx", "xls", "xlxs", "ppt", "pptx", "ttf", "otf", "eot", "svg"]
            }, {
                type: "ext",
                text: "Conteudos HTML",
                ext: ["css", "js", "html", "xml", "htc"]
            }, {
                type: "path",
                text: "path",
                ext: ["css", "js", "img", "Imagens", "images", "html"]
            }, res);
        });
    },

    checkOptionsInserted: function(req, res) {
        OptionSelect.getCountOpt(function() {
            request({ uri: url }, function(error, response, body) {
                if (error && response.statusCode !== 200) {
                    console.log('Error when contacting myawesomepage.com')
                }
                var $ = cheerio.load(body);
                $(".compact a").each(function() { //
                    var link = $(this);
                    var ll = link.html().replace(/[\n|\r|\t]/g, "");
                    // cria lista de todos links parafazer o parse
                    ll.indexOf("_module") !== -1 ? hreklink.push(url + "/" + link.attr("href")) : "";
                });
                getjson();
            });

        });
    }

};

function getjson() {
    if (hreklink[count]) {
        console.log("-------------------------------------------------------------------------- ", (count + 1));
        console.log(hreklink[count]);
        request({ uri: hreklink[count] }, function(error, response, body) {
            if (error /*&& response.statusCode !== 200*/ ) {
                console.log('Error when contacting myawesomepage.com')
            }
            var $ = cheerio.load(body);

            var fulldir = {};
            fulldir.pageUrlInfo = hreklink[count];
            fulldir.variables = [];
            fulldir.directives = [];
            $(".compact dt").each(function() {
                var dd = $(this);
                var vari = dd.html().replace(/<code>|<strong>|<\/strong>|<code>|<i>|<\/i>|<\/code>|<br>|<pre>|<\/pre>|\n|\t|\r/g, "").trim();
                vari.charAt(0) == "$" ? fulldir.variables.push(vari) : "";
            });


            $(".directive table tbody").each(function() {
                var tbody = $(this).children();
                var direc = true;
                var diretiveparam = "{";

                tbody.each(function() {
                    var trl = $(this);
                    var th = trl.children("th");
                    var td = trl.children("td");

                    var newth = '"' + th.html().replace(/<code>|<strong>|<\/strong>|<code>|<i>|<\/i>|<\/code>|<br>|<pre>|<\/pre>|\n|\t|\r/g, "").trim().toLowerCase() + '"';
                    var newtd = '"' + td.html().replace(/<code>|<strong>|<\/strong>|<code>|<i>|<\/i>|<\/code>|<br>|<pre>|<\/pre>|\n|\t|\r/g, "").trim() + '"';
                    if (direc) {
                        diretiveparam += '"directive": "' + newtd.replace(/["|;]/g, "").split(/ /)[0] + '",';
                        // diretiveparam += '"_id": "' + newtd.replace(/["|;]/g, "").split(/ /)[0] + '",';
                        direc = false;
                    }
                    diretiveparam += newth.replace(/:"/, '":') + newtd.replace(/;"/, '",');
                });
                var objdir = JSON.parse((diretiveparam + "}").replace(/""/g, '","'));
                fulldir.directives.push(JSON.parse(JSON.stringify(objdir)))
                delete objdir.syntax;
                delete objdir.default;
                sigleDiretive.push(objdir);
                diretiveparam = "";
            });
            count++;
            // console.log(fulldir);
            allFullDiretives.push(fulldir);
            getjson();
        });
    } else {
        console.log("------------------------------------ Fim --------------------------------- ");

        OptionSelect.InsertOptionSelectMulti(sigleDiretive);
        // console.log(sigleDiretive);
        OptionInfo.InsertOptionInfoMulti(allFullDiretives);
        // console.log(allFullDiretives);
    }
};