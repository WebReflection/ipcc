# ipcc
Standalone IP to ISO2 Country Code


## What Is This?
Based on [db-ip.com](https://db-ip.com) freely available database,
the aim of this program is to return a 2 chars Country Code given a generic ip.

The main reason this software exists is to quickly understand if an IP
comes from a European country and, as such, is subject to the [Cookie's Law absurdity](http://webreflection.blogspot.co.uk/2015/06/the-europeans-cookie-law-absurdity.html).


## How does it work
The list of known IPv4 and IPv6 is *stored entirely in RAM* in order
to grant zero dependencies and overall good performance if used as module.


### As module
```js
var
  ipcc = require('ipcc'),
  ip = '109.200.4.149'
;

// using an EU ip
ipcc.resolve(ip);     // "UK"
ipcc.isEU(ip);        // true

// using a non-EU ip
ip = '216.58.209.238';
ipcc.resolve(ip);     // "US"
ipcc.isEU(ip);        // false
```

The API is pretty basic, consisting in `resolve(is)`, `isEU(ip)`, `isIPv4(ip)`, and `isIPv6(ip)`.
Please note latter 2 methods are very simple and are not suitable to validate entirely IP v4 or v6 ddresses.


### As standalone
Used as stand alone, the script will actually use a lot of CPU in order to properly parse static Arrays defined in it.

However, this is the way you can use it:
```sh
$ ./ipcc 109.200.4.149  # UK (EU)
$ ./ipcc 216.58.209.238 # US
```
Please note that only *EU* countries will contain the `(EU)` suffix.



## How to build and create an SQLite version
In case you need this data as SQLite file, you can clone this repository locally and perform following operations:
```sh
$ git clone https://github.com/WebReflection/ipcc.git
$ cd ipcc
$ npm install
$ node generate.js
```
Above procedure should install locally [dblite](https://github.com/WebReflection/dblite#dblite),
download the database directly from [db-ip.com](https://db-ip.com/db/),
and create a file called dbip-country.sqlite.

It will also generate a fresh new copy of `build/ipcc` file.

In order to query the database, you can use [src/utils.js](https://github.com/WebReflection/ipcc/blob/master/src/utils.js) file
which together with `dblite` shouild give you the ability to query as such:
```js
// copy utils.js functions on top
var
  dblite = require('dblite'),
  db = dblite('dbip-country.sqlite'),
  // retrieve the IP the way you want
  ip = '109.200.4.149',
  table = isIPv4(ip) ? 'ipv4' : 'ipv6',
  norm = isIPv4(ip) ? ip2long(ip) : extendedIPv6(ip)
;
db.query(
  'SELECT country_code FROM ' + table +
  ' WHERE ? BETWEEN lower_bound AND upper_bound LIMIT 1',
  [norm],
  function (rows) {
    console.log(rows); // [['UK']]
    db.close();
  }
);
```


## License
All rights reserved to ip-db.com for their data. Mit Style License for the code I've written.