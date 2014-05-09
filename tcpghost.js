exports.createServer = createServer;

var util = require('util')
  , stream = require('stream')
  , pcap = require('pcap')
  , events = require('events')
  ;

function createServer(options, callback) {
  return new Server(options, callback);
}

function Server(arg0, arg1) {
  this.socketsBySessionKey = {};
  if (!arg0) return;
  if (!arg1) { 
    this.options = { pcap: { nic: 'any' } }; 
    var callback = arg0;
  } else {
    this.options = arg0;
    var callback = arg1;
  }
  this.on('connection', callback);
}
util.inherits(Server, events.EventEmitter);

Server.prototype.listen = function(port, host) {
  //console.log('listening', port, host, this.options);
  var pcap_session = pcap.createSession(this.options.pcap.nic, 'tcp port ' + port);
  var tracker = new pcap.TCP_tracker();
  tracker.on('start', (function(session) {
    //console.log('tracker start', JSON.stringify(session));
    var sock = new Socket(session);
    this.socketsBySessionKey[session.key] = sock;
    this.emit('connection', sock);
  }).bind(this));
  tracker.on('end', (function(session) {
    var sock = this.socketsBySessionKey[session.key];
    //console.log('tracker end', JSON.stringify(session));
    sock.emit('end');
  }).bind(this));
  tracker.on('received', (function(session, data) {
    var sock = this.socketsBySessionKey[session.key];
    //console.log('tracker received', data, sock);
    sock._emit_data(data);
  }).bind(this));
  pcap_session.on('packet', function(raw) {
    var packet = pcap.decode.packet(raw);
    //console.log('packet', JSON.stringify(packet));
    tracker.track_packet(packet);
  });
};

function Socket(session, localAddress, remotePort, remoteAddress) {
  stream.Duplex.call(this, {});

  var src = session.src.split(':');
  var dst = session.dst.split(':');
  this.localPort = parseInt(dst[1]);
  this.localAddress = dst[0];
  this.remotePort = parseInt(src[1]);
  this.remoteAddress = src[0];
}
util.inherits(Socket, stream.Duplex);

Socket.prototype._read = function(size) {
}

Socket.prototype.setEncoding = function(encoding) {
  this.encoding = encoding;
}

Socket.prototype._emit_data = function(data) {
  // TODO: be more strict on encodings
  if (this.encoding === 'utf8') {
    data = data.toString();
  }
  this.emit('data', data);
}

Socket.prototype._write = function(chunk, encoding, callback) {
  // just ignore what's written
  callback();
}
