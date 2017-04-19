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

  corpusWordCount = corpusWordCount.map((el) => {
    return Object.values(el);
  });

  $('#wordFreqTable').DataTable( {
    data: corpusWordCount,
    columns: [{title: "Term"}, {title: "Count"}]
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

  let theRoadNotTaken = structData.find(function(o) { return o.title == "The Road Not Taken"; });

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
    subject = { label: theRoadNotTaken.title, value: theRoadNotTaken[property.toString()]};
    v = structData.sort(sort_by(property, reverse, primer));
    v = v.slice(0, limit);
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

  nv.addGraph(function() {
    let structureChart = nv.models.discreteBarChart()
      .x(function(d) { return d.label })    //Specify the data accessors.
      .y(function(d) { return d.value })
      .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
      .showValues(false);      //...instead, show the bar value right on top of each bar.

    let structureChartData = d3.select('#structure-d3 svg');

    structureChartData.datum(generateData('lines', false, parseFloat, 5))
        .transition().duration(500)
        .call(structureChart);
    nv.utils.windowResize(structureChart.update);
    return structureChart;
  });

  function update(property, reverse, primer, limit) {
    nv.addGraph(function() {
      let structureChart = nv.models.discreteBarChart()
        .x(function(d) { return d.label })    //Specify the data accessors.
        .y(function(d) { return d.value })
        .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
        .showValues(false);      //...instead, show the bar value right on top of each bar.

      let structureChartData = d3.select('#structure-d3 svg');

      structureChartData.datum(generateData(property, reverse, parseFloat, limit))
          .transition().duration(500)
          .call(structureChart);
      nv.utils.windowResize(structureChart.update);
      return structureChart;
    });
  };

  document.getElementById('btn1').addEventListener("click", function(event) {
    event.preventDefault();
    let limit = parseInt($('#limit').val());
    let sort = (parseInt($('#sort').val()) == 1) ? true : false;
    let prop = $('#property').val();
    update(prop, sort, parseFloat, limit);
  });
});
