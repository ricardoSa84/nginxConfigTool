
var fs = require('fs');
var toWrite = {
  prop1: 'prop1',
  prop2: 'prop2',
  server:{
    firstProp:'myfisrt prop',
    serverProp1: 'prop1',
    serverProp2: 'prop2',
    location:{
      firstProp:'myfisrt prop1',
      locationProp1: 'prop1',
      locationProp2: 'prop2'
    }
  }
}
writeJsonToFile(toWrite,'test');
toWrite = '';

function recurFill(obj){
  if(obj!=undefined){
    for(var i = 0; i< Object.keys(obj).length; i++){
      if(typeof obj[Object.keys(obj)[i]] == 'object'){
        toWrite += obj[Object.keys(obj)[i]].firstProp + ';\n';
        delete obj[Object.keys(obj)[i]].firstProp;
        recurFill(obj[Object.keys(obj)[i]]);
      }else{
        toWrite += Object.keys(obj)[i] + ' ' + obj[Object.keys(obj)[i]] + ';\n';
      }
    }
  }
}

function writeJsonToFile(obj,name){
  fs.writeFile(getFullPath(name,'.json'), JSON.stringify(obj, null, 4),writeCallBack);
}

function writeCallBack(err){
    if (err) {
        console.error(err);
        return;
    };
    readJsonFomFile('test');
}

function readJsonFomFile(name){
  fs.readFile(getFullPath(name,'.json'), 'utf8',readCallBack);
}
function readCallBack(err,data){
  if (err) {
      console.error(err);
      return;
  };
  var obj = JSON.parse(data);
  recurFill(obj);
  console.log('toWrite :',toWrite);
}

function getFullPath(name,ext){
  var filePath = name;
  var extIfNeeded = filePath.indexOf('.')>-1 ? '' : ext;
  return filePath + extIfNeeded;
}
