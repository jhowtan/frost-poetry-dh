var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
let fs = require('fs');
let path = require('path');

const directoryName = path.dirname(__filename);
const creds = {
  tone: {
    "username": "redacted",
    "password": "redacted"
  },
  nlu: {
    "username": "redacted",
    "password": "redacted"
  }
};

let toneAnalyzer = new ToneAnalyzerV3({
  username: creds.tone.username,
  password: creds.tone.password,
  version: 'v3',
  version_date: '2017-03-15'
});

var nlu = new NaturalLanguageUnderstandingV1({
  username: creds.nlu.username,
  password: creds.nlu.password,
  version_date: NaturalLanguageUnderstandingV1.VERSION_DATE_2017_02_27
});

function generateToneAnalysis(title, poem) {
  let toneParams = {
    'text': poem,
    'isHTML': false,
    'sentences': false
  };
  let nluParams = {
    'text': poem,
    'features': {
      'keywords': {
        'emotion': true,
        'sentiment': true,
        'limit': 10
      },
      'sentiment': {}
    }
  }
  toneAnalyzer.tone(toneParams, function(err, res1){
    if (err) { console.log(err); }
    else {
      nlu.analyze(nluParams, function(err, res2){
        if (err) { console.log(err); }
        else {
          var result = Object.assign({"title": title}, res1, res2);
          prettyJson = JSON.stringify(result, null, 2);
          fs.appendFileSync('./sentiments.json', prettyJson, {encoding: 'utf8'});
          console.log(`Retrieved Watson Analysis for ${title}`);
        }
      });
    }
  });
}

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

// fs.writeFileSync('./s.json', '', 'utf8');

// fs.readdir('./missing', function(err, files) {
//   var index = files.indexOf(".DS_Store");
//   if (index >= 0) {
//     files.splice(index, 1 );
//   }
//   for (var i = 0; i<files.length; i++) {
//     console.log(files[i]);
//     file = fs.readFileSync(path.join(directoryName+'/missing', files[i]), {encoding: 'utf8'});
//     generateToneAnalysis(files[i], file);
//   }
// });

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
    readFiles(dirname, generateToneAnalysis, function(err) {
      console.log(err);
    });
  }
});
