let fs = require('fs');
let path = require('path');

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
        onFileContent(filename.replace(' - result.json', ''), content);
      });
    });
  });
}

let mergeSentiments = (title, content) => {
  console.log(title, "- merging with sentiments");
  var json = JSON.parse(content);
  json.title = title;
  var pretty = JSON.stringify(json);
  fs.appendFileSync('./merged_title_with_sentiment.json', pretty, {encoding: 'utf8'});
}

fs.writeFileSync('./merged_title_with_sentiment.json', '', 'utf8');

fs.readdir('./sentiments', function(err, folders){
  if (err) {
    console.log(err);
    return;
  }
  var index = folders.indexOf(".DS_Store");
  if (index >= 0) {
    folders.splice(index, 1 );
  }
  for (var i = 0; i < folders.length; i++) {
    let dirname = path.join('./sentiments', folders[i]);
    readFiles(dirname, mergeSentiments, function(err) {
      console.log(err);
    });
  }
});
