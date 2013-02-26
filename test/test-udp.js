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

var UdpHeader = require('../udp');

var IpHeader = require('ip-header');
var path = require('path');
var pcap = require('pcap-parser');

var FILE = path.join(__dirname, 'data', 'netbios-ns-b-query-winxp.pcap');

module.exports.fromBuffer = function(test) {
  test.expect(5);
  var parser = pcap.parse(FILE);
  parser.on('packetData', function(buf) {
    var offset = 14;
    var iph = new IpHeader(buf, offset);
    var udp = new UdpHeader(buf, offset + iph.length);

    test.equal(137, udp.srcPort);
    test.equal(137, udp.dstPort);
    test.equal(50, udp.dataLength);
    test.equal(58, udp.totalLength);
    test.equal(8, udp.length);
    test.done();
  });
};

module.exports.toBuffer = function(test) {
  test.expect(8);

  var parser = pcap.parse(FILE);
  parser.on('packetData', function(buf) {
    var offset = 14;
    var iph = new IpHeader(buf, offset);
    offset += iph.length;

    var udp = new UdpHeader(buf, offset);

    var out = udp.toBuffer({ip: iph, data: buf, offset: offset + udp.length});

    for (var i = 0, n = udp.length; i < n; ++i) {
      test.equal(buf.readUInt8(offset + i), out.readUInt8(i));
    }

    test.done();
  });
};
