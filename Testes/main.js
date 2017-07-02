var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World! ' + new Date().toString() + ' - ' + process.env.PORT);
});

app.get('/login', function (req, res) {
  res.send('Login! ' + new Date().toString());
});

app.get('/error', function (req, res) {
  res.status(500).send('Ja foste '  + new Date().toString());
});

app.listen(process.env.PORT, function () {
  console.log('Example app listening on port ' + process.env.PORT);
});
