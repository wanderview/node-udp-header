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

// By default, the UDP checksum is set to zero.  To calculate the checksum
// you must provide more information about the overall packet.  Specifically,
// the src IP, dst IP, and data buffer.
var packet = {
  ip: {
    src: '1.1.1.1',
    dst: '2.2.2.2',
  },
  data: new Buffer(508),
  offset: 8
};
var outWithChecksum = udph.toBuffer(packet);

// Usually you will have an existing buffer to write to.  For example,
// our packet object above has an adequately sized buffer already
// containing the data.  We just need to prepend the header.
//
// To write a buffer in place, provide the buffer and option offset
// after the packet object.
udph.toBuffer(packet, packet.data, 0);
```
