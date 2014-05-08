var assert = require('assert')
  , net = require('net')
  , tcpghost = require('../tcpghost')
  ;


describe('The tcpghost module', function() {
  it('should just work', function(done) {
    var real_rx = [];
    var ghost_rx = [];

    var real = net.createServer(function(sock) {
      real_rx.push({connected:{uri:uri(sock)}});     
      sock.setEncoding('utf8');
      sock.on('data', function(utf8) {
        real_rx.push({data:{uri:uri(sock),utf8:utf8}});
      });
    });
    real.listen(7777);

    var ghost = tcpghost.createServer(function(sock) {
      ghost_rx.push({connected:{uri:uri(sock)}});     
      sock.setEncoding('utf8');
      sock.on('data', function(utf8) {
        ghost_rx.push({data:{uri:uri(sock),utf8:utf8}});
      });
    });
    ghost.listen(7777);

    var csock = net.createConnection(7777, 'localhost');
    csock.write('hello world');

    setTimeout(function() {
      //console.log('real_rx', real_rx);
      assert.deepEqual([
        {connected:{uri:'tcp://127.0.0.1:' + csock.localPort + '/127.0.0.1:7777'}},
        {data:{uri:'tcp://127.0.0.1:' + csock.localPort + '/127.0.0.1:7777',utf8:'hello world'}}
      ], real_rx);
      console.log('ghost_rx', ghost_rx);
      assert.deepEqual([
        {connected:{uri:'tcp://127.0.0.1:' + csock.localPort + '/127.0.0.1:7777'}},
        {data:{uri:'tcp://127.0.0.1:' + csock.localPort + '/127.0.0.1:7777',utf8:'hello world'}}
      ], ghost_rx);
      done();
    }, 1000);
  });
});

function uri(sock) {
  return 'tcp://' + sock.remoteAddress + ':' + sock.remotePort + '/'
       + sock.localAddress + ':' + sock.localPort;
}

