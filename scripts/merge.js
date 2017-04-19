let fs = require('fs');
let newJson = require('./newJson.json');
let docJson = require('./document_stats.json');
let sentJson = require('./merged_title_with_sentiment.json');
let mergedJson = require('./mergedJson.json');

let arrayA = newJson.new;
let arrayB = docJson.document_stats;
let arrayC = sentJson;
let arrayD = mergedJson;

function findByTitle(element, title) {
  return element.Title === title;
}

// let mergedArray = [];
// for (let i = 0; i < arrayB.length; i++) {
//   let bTitle = arrayB[i].title;
//   for (let j = 0; j < arrayA.length; j++) {
//     if (arrayA[j].title === bTitle) {
//       let mergedObj = Object.assign({}, arrayB[i], arrayA[j]);
//       mergedArray.push(mergedObj);
//       break;
//     }
//   }
// }
// fs.writeFileSync('mergedJson.json', JSON.stringify(mergedArray, null, 2), 'utf-8');

let mergedArray = [];
for (let i = 0; i < arrayD.length; i++) {
  let bTitle = arrayD[i].title;
  for (let j = 0; j < arrayC.length; j++) {
    if (arrayC[j].title === bTitle) {
      let mergedObj = Object.assign({}, arrayD[i], arrayC[j]);
      mergedArray.push(mergedObj);
      break;
    }
  }
}
console.log(mergedArray, mergedArray.length);
fs.writeFileSync('newMergedJson.json', JSON.stringify(mergedArray, null, 2), 'utf-8');
