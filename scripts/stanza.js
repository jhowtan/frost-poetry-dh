let fs = require('fs');
let path = require('path');
const directoryName = path.dirname(__filename);

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    var index = filenames.indexOf(".DS_Store");
    if (index >= 0) {
      filenames.splice(index, 1 );
    }
    filenames.forEach(function(filename) {
      fs.readFile(path.join(dirname,filename), 'utf8', function(err, content) {
        if (err) {
          onError(err);
          return;
        }
        onFileContent(filename.substring(0, filename.length-4), content);
      });
    });
  });
}

let createLineTokenCountArray = (content) => {
  // Take careful precaution that each poem document should end with a newline char
  let lines = content.split('\n');
  let wordsPerLine = lines.map(function(line){
    line = line.split(/ |-|—/);
    if (line.length == 1 && line[0] === '') {
      return 0;
    }
    if (line.length > 1) {
      line = line.filter(function(token) {
        return token !== '';
      });
    }
    return line.length;
  });
  return wordsPerLine;
};

let createStanzaArray = (wordsPerLine) => {
  let beginIdx = 0;
  let stanzaArray = [];
  for (var i = 0; i<wordsPerLine.length; i++) {
    if (wordsPerLine[i] == 0) {
      stanza = wordsPerLine.slice(beginIdx, i);
      stanzaArray.push(stanza);
      beginIdx = i+1;
    }
    if (i == wordsPerLine.length && stanzaArray.length == 0) {
      stanzaArray.push(wordsPerLine);
    }
  }
  return stanzaArray;
};

let getLinesPerStanza = (stanzaArray) => {
  let linesInStanza = stanzaArray.map(function(stanza) {
    return stanza.length;
  });
  return linesInStanza.reduce((a, b) => a + b, 0) / linesInStanza.length;
};

let getWordsPerStanza = (stanzaArray) => {
  let wordsInStanza = stanzaArray.map(function(stanza) {
    return stanza.reduce((a, b) => a + b, 0);
  });
  return wordsInStanza.reduce((a, b) => a + b, 0) / wordsInStanza.length;
};

let getLines = (stanzaArray) => {
  let lines = 0;
  stanzaArray.forEach(function(stanza){
    lines += stanza.length;
  })
  return lines;
}
let getWords = (stanzaArray) => {
  let numWords = 0;
  stanzaArray.forEach(function(stanza){
    stanza.forEach(function(line){
      numWords += line;
    });
  });
  return numWords;
}
let getWordsPerLine = (stanzaArray) => {
  let numLines = getLines(stanzaArray);
  let numWords = 0;
  stanzaArray.forEach(function(stanza){
    stanza.forEach(function(line){
      numWords += line;
    });
  });
  return numWords/numLines;
};

fs.writeFileSync('./newJson.json', '', 'utf8');

fs.readdir('./poems', function(err, folders){
  if (err) {
    console.log(err);
    return;
  }
  var index = folders.indexOf(".DS_Store");
  if (index >= 0) {
    folders.splice(index, 1 );
  }
  for (var i = 0; i < folders.length; i++) {
    let dirname = path.join('./poems', folders[i]);
    let collectionName = folders[i].replace(/-/g,' ');
    readFiles(dirname, function(title, content) {
      let wordsPerLine = createLineTokenCountArray(content);
      let stanzaArray = createStanzaArray(wordsPerLine);
      let poemObject = {
        "title": title,
        "collection": collectionName,
        "year_published": title.split('-')[0].trim(),
        "stanzas": stanzaArray.length,
        "lines": getLines(stanzaArray),
        "lines_per_stanza": getLinesPerStanza(stanzaArray),
        "words_per_stanza": getWordsPerStanza(stanzaArray),
        "words_per_line": getWordsPerLine(stanzaArray)
      };
      fs.appendFileSync('./newJson.json', JSON.stringify(poemObject, null, 2));
    }, function(err) {
      if (err) { console.log(err);}
    });
  }
});
