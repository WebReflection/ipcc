#!/usr/bin/env node

var
  fs = require('fs'),
  zlib = require('zlib'),
  dbName = require('path').resolve('./dbip-country.csv'),
  dbURL = 'http://download.db-ip.com/free/dbip-country-2015-06.csv.gz',
  dblite = require('dblite')
;

eval([
  fs.readFileSync('./src/eu-countries.js'),
  fs.readFileSync('./src/utils.js')
].join('\n'));

function generate() {
  var db = dblite(dbName.replace('.csv', '.sqlite'));
  var ipv4JS = [];
  var ipv6JS = [];
  var ipv4JSIndex = [];
  var ipv6JSIndex = [];
  db
    .query('DROP TABLE IF EXISTS europe')
    .query('DROP TABLE IF EXISTS ipv4')
    .query('DROP TABLE IF EXISTS ipv6')
    .query('.import "' + dbName + '" country_tmp')
    .query([
      'CREATE TABLE europe (',
        'country_code CHAR(2) NOT NULL',
      ')'
    ].join('\n'))
    .query('INSERT INTO europe VALUES ("' + Object.keys(EUCountries).join('"), ("') + '")')
    .query([
      'CREATE TABLE ipv4 (',
        'country_code CHAR(2) NOT NULL,',
        'lower_bound UNSIGNED INTEGER NOT NULL,',
        'upper_bound UNSIGNED INTEGER NOT NULL',
      ')'
    ].join('\n'))
    .query([
      'CREATE TABLE ipv6 (',
        'country_code CHAR(2) NOT NULL,',
        'lower_bound CHAR(39) NOT NULL,',
        'upper_bound CHAR(39) NOT NULL',
      ')'
    ].join('\n'))
    .query('SELECT * FROM country_tmp', function (rows) {
      db.query('BEGIN TRANSACTION');
      rows.forEach(function (row) {
        var
          lowerBound = row[0],
          upperBound = row[1],
          countryCode = fixedISO2CountryCore(row[2]),
          ipv4 = isIPv4(lowerBound),
          ipvJS = ipv4 ? ipv4JS : ipv6JS,
          ipvJSIndex = ipv4 ? ipv4JSIndex : ipv6JSIndex,
          table = ipv4 ? 'ipv4' : 'ipv6',
          transform = ipv4 ? ip2long : extendedIPv6,
          lb = transform(lowerBound),
          ub = transform(upperBound)
        ;
        ipvJSIndex[ipvJS.push(lb, ub) - 2] = countryCode;
        db.query('INSERT INTO ' + table + ' VALUES (?, ?, ?)', [
          countryCode, lb, ub
        ]);
      });
      db.query('COMMIT');
      db.query('DROP TABLE country_tmp');
      db.query('SELECT "Geo database successfully imported"', function (rows) {
        console.log(rows[0][0]);
        db.close();
        fs.writeFileSync(
          './build/ipcc',
          fs.readFileSync('./src/template.js')
            .toString()
            .replace('//:LICENSE.txt', fs.readFileSync('./LICENSE.txt'))
            .replace('//:utils.js', fs.readFileSync('./src/utils.js'))
            .replace('//:eu-countries.js', fs.readFileSync('./src/eu-countries.js'))
            .replace('//:ipv4', 'var ipv4 = ' + JSON.stringify(ipv4JS) + ';')
            .replace('//:ipv4-length', 'var ipv4Length = ' + ipv4JS.length + ';')
            .replace('//:ipv4-countries', 'var ipv4Countries = ' + JSON.stringify(ipv4JSIndex) + ';')
            .replace('//:ipv6', 'var ipv6 = ' + JSON.stringify(ipv6JS) + ';')
            .replace('//:ipv6-length', 'var ipv6Length = ' + ipv6JS.length + ';')
            .replace('//:ipv6-countries', 'var ipv6Countries = ' + JSON.stringify(ipv6JSIndex) + ';')
        );
        var ipcc = require('./build/ipcc');
        var ip = '86.141.168.112';
        console.assert(ipcc.resolve(ip) === 'UK', 'recognizes a UK ipv4 address');
        console.assert(ipcc.isEU(ip), 'UK is recognized as EU');
        ip = 'fe80::200:f8ff:fe21:67cf';
        console.assert(ipcc.resolve(ip) === 'US', 'recognizes a US ipv6 address');
        console.assert(!ipcc.isEU(ip), 'US is recognized as non EU');
      });
    })
  ;
}

if (!fs.existsSync(dbName)) {
  require('http' + (
    dbURL.indexOf('https://') ? '' : 's'
  )).get(dbURL, function(res) {
    if (res.statusCode === 200) {
      res.pipe(zlib.createGunzip()).pipe(fs.createWriteStream(dbName));
      res.on('end', generate);
    }
  }).on('error', function(e) {
    console.error("Unable to grab the database: " + e.message);
  });
} else {
  generate();
}
