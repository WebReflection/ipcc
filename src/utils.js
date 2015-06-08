// normalizes ipv6 strings as 39 chars
function extendedIPv6(ip) {
  var
    i = ip.indexOf('::'),
    prefix, suffix,
    a
  ;
  if (-1 < i) {
    prefix = ip.slice(0, i).split(':');
    suffix = ip.slice(i + 2).split(':');
    a = prefix.concat(Array(8 - (prefix.length + suffix.length)), suffix);
  } else {
    a = ip.split(':');
  }
  for (i = 0; i < 8; i++) {
    a[i] = ('0000' + (a[i] || '')).slice(-4);
  }
  return a.join(':');
}

// returns ipv4 addresses as number
var ip2long = (function (pow) {
  function reducer(p, c, i) {
    return p + parseInt(c, 10) * pow(256, 3 - i);
  }
  return function ip2long(ip) {
    return ip.split('.').reduce(reducer, 0);
  };
}(Math.pow));

// basic ipv4 check
var IPv4 = /^\d+\.\d+\.\d+\.\d+$/;
function isIPv4(ip) {
  return IPv4.test(ip);
}

// basic ipv6 check
var IPv6 = /^[a-f0-9:]{2,39}$/;
function isIPv6(ip) {
  return IPv6.test(ip);
}

// returns typed Int32Array if possible
var Int32ArrayMaybe = typeof Int32Array === typeof Array ? Int32Array : Object;