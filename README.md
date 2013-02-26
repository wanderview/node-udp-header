# udp-header

UDP header serialization.

[![Build Status](https://travis-ci.org/wanderview/node-udp-header.png)](https://travis-ci.org/wanderview/node-udp-header)

## Example

```javascript
var UdpHeader = require('udp-header');

// parse UDP headers in
var udph = new UdpHeader(buf, offset);
udph.srcPort === 52;
udph.dstPort === 5432;
udph.dataLength === 500;

// write UDP headers out
udph.toBuffer();

// or write the UDP header out in-place without creating a new Buffer
var out = new Buffer(508);
udph.toBuffer(out, 0);
data.copy(out, udph.length);
```
