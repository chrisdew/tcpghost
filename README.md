TCP Ghost
=========

A drop-in replacement for net.createServer which uses pcap to create ghost connections (also known as tees or clones).


Scope
-----

This modules was written for the following circumstance - if your problem is similar, it may work for you too.

I have an old daemon in production which is accepting TCP connections, where the source IP address is of vital importance.

I want to test a replacement daemon (written in NodeJS) but cannot bind to the TCP port, as it is already in use by the old daemon.

Normally I would insert a tee (npm install duplicator) to do this job.  Unfortunately this has the side affect of making all TCP connection appear to orginate at localhost, whichis unacceptable.


Solution
--------

TCP Ghost uses libpcap (like tcpdump and Wireshark) to watch all the packets.

TCP Ghost is used exactly like the `net` module.

```
    var ghost = tcpghost.createServer(function(sock) {
      console.log('connected');
      sock.setEncoding('utf8');
      sock.on('data', function(data) {
        console.log('data', data);
      });
    });
    ghost.listen(7777);
```

See the example and test directories for more details.

The duplication of the `net` API means that the new daemon can just have it's `createServer` line modded to test in parallel with an existing server.

Note: There must another process already listening to the port to which you tcpghost binds, otherwise there is no traffic to listen to. 


Running the Examples
--------------------

For this you will need to checkout the git repo.

You will need three terminals.

T1:
```
$ git clone https://github.com/chrisdew/tcpghost
```

To be continued...


Warnings
--------

It is currently in early development, but go ahead and give it a try.


