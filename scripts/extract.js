var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');

var directoryName = path.dirname(__filename);

function readPoem(file) {
  var html = fs.readFileSync(file, 'utf8');
  var $ = cheerio.load(html);
  var poem = {
    title: $('body > table:nth-child(4) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(2) > tr:nth-child(3) > td > font > b').text().replace(/([0-9]+)\. /, '').trim(),
    body: $('body > table:nth-child(4) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(3) > tr > td').text().replace(/([0-9]+)/g, '').trim()
  };
  return poem;
}

for (var i = 1; i <= 15; i++) {
  var data = readPoem(path.join(directoryName, i.toString() + '.html'));
  var filePathName = path.join(directoryName, data.title + '.txt');
  fs.writeFileSync(filePathName, data.body);
}
