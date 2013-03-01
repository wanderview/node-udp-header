// Copyright (c) 2013, Benjamin J. Kelly ("Author")
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

'use strict';

module.exports = UdpHeader;

var ip = require('ip');

var LENGTH = 8;

function UdpHeader(opts, offset) {
  if (opts instanceof Buffer) {
    return UdpHeader.fromBuffer(opts, offset);
  }

  var self = (this instanceof UdpHeader)
           ? this
           : Object.create(UdpHeader.prototype);

  opts = opts || {};

  self.srcPort = ~~opts.srcPort;
  self.dstPort = ~~opts.dstPort;
  self.length = LENGTH;
  if (typeof opts.dataLength === 'number') {
    self.dataLength = ~~opts.dataLength;
    self.totalLength = self.dataLength + self.length;
  } else if (typeof opts.totalLength === 'number') {
    self.totalLength = ~~opts.totalLength;
    self.dataLength = self.totalLength - self.length;
  }

  self.checksum = ~~opts.checksum;

  return self;
}

UdpHeader.fromBuffer = function(buf, offset) {
  offset = ~~offset;

  var srcPort = buf.readUInt16BE(offset);
  offset += 2;

  var dstPort = buf.readUInt16BE(offset);
  offset += 2;

  // length in bytes of header + data
  var totalLength = buf.readUInt16BE(offset);
  offset += 2;

  var checksum = buf.readUInt16BE(offset);
  offset += 2;

  // TODO: validate checksum?

  return new UdpHeader({srcPort: srcPort, dstPort: dstPort,
                        totalLength: totalLength, checksum: checksum});
}

UdpHeader.prototype.toBuffer = function(buf, offset) {
  offset = ~~offset;
  buf = (buf instanceof Buffer) ? buf : new Buffer(offset + LENGTH);

  buf.writeUInt16BE(this.srcPort, offset);
  offset += 2;

  buf.writeUInt16BE(this.dstPort, offset);
  offset += 2;

  buf.writeUInt16BE(this.totalLength, offset);
  offset += 2;

  buf.writeUInt16BE(this.checksum, offset);
  offset += 2;

  return buf;
}

UdpHeader.prototype.setChecksum = function(iph, data, offset) {
  offset = ~~offset;

  var sum = 0;

  var ipBuf = new Buffer(8);
  ip.toBuffer(iph.src, ipBuf, 0, 4);
  ip.toBuffer(iph.dst, ipBuf, 4, 4);
  sum += ipBuf.readUInt16BE(0);
  sum += ipBuf.readUInt16BE(2);
  sum += ipBuf.readUInt16BE(4);
  sum += ipBuf.readUInt16BE(6);

  sum += 17;
  sum += this.totalLength;

  sum += this.srcPort;
  sum += this.dstPort;
  sum += this.totalLength;

  var i, n;
  for (i = offset, n = offset + this.dataLength; i < n; i += 2) {
    sum += data.readUInt16BE(i);
  }

  if (i > n) {
    sum += data.readUInt8BE(n - 1) << 8;
  }

  var carry = (sum & 0x0f0000) >> 16;
  var checksum = (~(sum + carry)) & 0xffff;

  if (!checksum) {
    checksum = 0xffff;
  }

  this.checksum = checksum;

  return this.checksum;
};
