$(document).ready(function() {
  structDataForTable = structData.map((el) => {
    el.title = el.title.replace(/(\d)+ - /, '');
    if (el.ratio.toString().length > 6) { el.ratio = el.ratio.toPrecision(5); }
    if (el.words_per_sentence.toString().length > 6) { el.words_per_sentence = el.words_per_sentence.toPrecision(5); }
    if (el.lines_per_stanza.toString().length > 6) { el.lines_per_stanza = el.lines_per_stanza.toPrecision(5); }
    if (el.words_per_stanza.toString().length > 6) { el.words_per_stanza = el.words_per_stanza.toPrecision(5); }
    if (el.words_per_line.toString().length > 6) { el.words_per_line = el.words_per_line.toPrecision(5); }
    return Object.values(el);
  });

  $('#structureTable').DataTable( {
    data: structDataForTable,
    columns: [
        { title: "Title" },
        { title: "Words" },
        { title: "Types" },
        { title: "Ratio" },
        { title: "Words/Sentence" },
        { title: "Collection" },
        { title: "Year Published" },
        { title: "Stanzas" },
        { title: "Lines" },
        { title: "Lines/Stanza" },
        { title: "Words/Stanza" },
        { title: "Words/Line" },
    ]
  });

  var sort_by = function(field, reverse, primer){
    var key = primer ?
       function(x) {return primer(x[field])} :
       function(x) {return x[field]};
    reverse = !reverse ? 1 : -1;
    return function (a, b) {
      return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    }
  };

  function generateData(property, reverse, primer, limit) {
    let subject = structData.find(function(o) { return o.title == "The Road Not Taken"; });
    subject = { label: subject.title, value: subject[property.toString()]};
    v = structData.sort(sort_by(property, reverse, primer));
    v = v.slice(0, limit+1);
    v = v.map((e)=>{
      return {
        label: e.title,
        value: e[property.toString()]
      };
    });
    let exists = v.find(function(o) { return o.title == "The Road Not Taken"; });
    if (exists === undefined) {
      v.unshift(subject);
    }
    return [
      {
        key: property.toString(),
        values: v
      }
    ];
  }

  let structureChart = nv.models.discreteBarChart()
        .x(function(d) { return d.label })    //Specify the data accessors.
        .y(function(d) { return d.value })
        .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
        .showValues(false);      //...instead, show the bar value right on top of each bar.

  let structureChartData = d3.select('#structure-d3 svg');

  nv.addGraph(function() {
    structureChartData.datum(generateData('words_per_stanza', false, parseFloat, 10))
        .transition().duration(500)
        .call(structureChart);
    nv.utils.windowResize(structureChart.update);
    return structureChart;
  });

  function update(property, reverse, primer, limit) {
    let data = generateData(property, reverse, primer, limit);
    // Update the SVG with the new data and call chart
    structureChartData = d3.select('#structure-d3 svg');
    structureChartData.datum(data)
        .transition().duration(500)
        .call(structureChart);
    nv.utils.windowResize(structureChart.update);
  };

  document.getElementById('btn1').addEventListener("click", function() {
    update('words_per_stanza', false, parseFloat, 10);
  });
  document.getElementById('btn2').addEventListener("click", function() {
    update('lines_per_stanza', false, parseFloat, 10);
  });
  document.getElementById('btn3').addEventListener("click", function() {
    update('words_per_line', false, parseFloat, 10);
  });
});
