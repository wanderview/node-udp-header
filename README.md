# udp-header

UDP header serialization.

[![Build Status](https://travis-ci.org/wanderview/node-udp-header.png)](https://travis-ci.org/wanderview/node-udp-header)

## Example

```javascript
var UdpHeader = require('udp-header');

// parse UDP headers in
var udph = new UdpHeader(inputBuf, inputOffset);
udph.srcPort === 52;
udph.dstPort === 5432;
udph.dataLength === 500;
udph.totalLength === 508;
udph.length === 8;

// write UDP headers out
var out = udph.toBuffer();

// By default, the UDP checksum is not calculated.  It is passed through if
// you parse an existing buffer or set the opts.checksum constructor option.
//
// To calculate the checksum you must call setChecksum() with the ip header
// object and udp payload buffer.
var iph = new IpHeader({dst:'1.1.1.1', src:'2.2.2.2'});
udph.setChecksum(iph, payloadBuf, payloadOffset);

// To write a buffer in place, provide the buffer and option offset
// after the packet object.
udph.toBuffer(buf, offset);
```
