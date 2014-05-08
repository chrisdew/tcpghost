var net = require('net');

var real = net.createServer(function(sock) {
  var uri = 'tcp://' + sock.remoteAddress + ':' + sock.remotePort + '/'
          + sock.localAddress + ':' + sock.localPort;
  console.log('real connection ', uri);
  sock.on('data', function(data) {
    console.log('real data from', uri, data);
  });
  sock.on('error', function(err) {
    console.error('real error', uri, err);
  });
  sock.on('end', function(err) {
    console.error('real end', uri);
  });
});

real.listen(7777);
