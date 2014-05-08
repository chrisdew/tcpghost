var tcpghost = require('../tcpghost');

var ghost = tcphost.createServer(function(sock) {
  var uri = 'tcp://' + sock.remoteAddress + ':' + sock.remotePort + '/'
          + sock.localAddress + ':' + sock.localPort;
  console.log('ghost connection', uri);
  sock.on('data', function(data) {
    console.log('ghost data from', uri, data);
  });
  sock.on('error', function(err) {
    console.error('ghost error', uri, err);
  });
  sock.on('end', function(err) {
    console.error('ghost end', uri);
  });
});

ghost.listen(7777);
