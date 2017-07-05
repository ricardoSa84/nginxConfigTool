var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World! ' + new Date().toString() + ' - Port -> "' + process.env.PORT + '"');
});

app.get('/Teste', function (req, res) {
  res.send('Teste! ' + new Date().toString() + ' - Port -> "' + process.env.PORT + '"');
});

app.get('/TesteRedirect', function (req, res) {
  res.send('Teste Redirect! ' + new Date().toString() + ' - Port -> "' + process.env.PORT + '"');
});

app.get('/Redirected', function (req, res) {
  res.send('Redirected! ' + new Date().toString() + ' - Port -> "' + process.env.PORT + '"');
});

app.get('/TestCache', function(req, res) {
    res.sendFile(__dirname + '/test.html');
});

app.get('/error', function (req, res) {
  res.status(500).send('Ja foste '  + new Date().toString());
});

app.listen(process.env.PORT, function () {
  console.log('Example app listening on port ' + process.env.PORT);
});
