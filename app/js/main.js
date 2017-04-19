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

  function generateData() {
    v = structData.filter(function(el) {
      return (el.words_per_line > 7);
    });
    v = v.map((e)=>{
      return {
        label: e.title,
        value: e.words_per_line
      };
    });
    return [
      {
        key: "Word Per Line",
        values: v
      }
    ];
  }

  nv.addGraph(function() {
    var chart = nv.models.discreteBarChart()
        .x(function(d) { return d.label })    //Specify the data accessors.
        .y(function(d) { return d.value })
        .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
        // .tooltips(true)        //Don't show tooltips
        .showValues(false);       //...instead, show the bar value right on top of each bar.

    d3.select('#chart-from-table svg')
        .datum(generateData())
        // .transition().duration(500)
        .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });



});
