#!/usr/bin/env node

// (C) The DB-IP Database - "Free IP address to country" CSV file
// (C) Andrea Giammarchi - JS module and logic

//:LICENSE.txt

//:utils.js
//:eu-countries.js

// List of all known IPv4 and their countries per each range
//:ipv4
//:ipv4-length
//:ipv4-countries

// List of all known IPv6 and their countries per each range
//:ipv6
//:ipv6-length
//:ipv6-countries

var lastIP, lastCountry;
function resolve(ip) {
  if (ip === lastIP) return lastCountry;
  var
    is4 = isIPv4(ip),
    address = is4 ? ip2long(ip) : extendedIPv6(ip),
    ips = is4 ? ipv4 : ipv6,
    length = is4 ? ipv4Length : ipv6Length,
    countries = is4 ? ipv4Countries : ipv6Countries,
    i = 0
  ;
  lastIP = ip;
  lastCountry = '';
  while (i < length) {
    if (ips[i] <= address && address <= ips[i + 1]) {
      lastCountry = countries[(i / 2) || 0];
      return lastCountry;
    }
    i += 2;
  }
  return lastCountry;
}

function isEU(ip) {
  return EUCountries.hasOwnProperty(resolve(ip));
}

if (module.parent) {
  module.exports = {
    resolve: resolve,
    isIPv4: isIPv4,
    isIPv6: isIPv6,
    isEU: isEU
  };
} else {
  (function (ip) {
    if (isIPv4(ip) || isIPv6(ip)) {
      console.log(resolve(ip) + (isEU(ip) ? ' (EU)' : ''));
    } else {
      console.log('');
      console.log('usage example');
      console.log('  ./ipcc 86.141.168.112');
      console.log('  ./ipcc fe80::200:f8ff:fe21:67cf');
      console.log('');
    }
  }(process.argv.pop()));
}