// 127.0.0.1 evil.local trusted.local

var express = require('express');

var app = express();
var evil = express();
var trusted = express();

[
  app,
  evil,
  trusted
].forEach(function(server) {
  server.set('x-powered-by', false);
  server.use( express.compress() );
  server.use( express.favicon() );
  server.use( express.logger('dev') );
});

evil.use('/', express.static('evil'));
trusted.use('/', express.static('trusted'));

app.use(express.vhost('evil.local', evil));
app.use(express.vhost('trusted.local', trusted));

app.listen( 8000 );

console.log('listening on port: 8000');
