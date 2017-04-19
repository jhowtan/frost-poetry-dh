$(document).ready(function() {

  /*****************
  ** DATA PREPARATION
  *****************/

  structDataForTable = structData.map((el) => {
    el.title = el.title.replace(/(\d)+ - /, '');
    if (el.ratio.toString().length > 6) { el.ratio = el.ratio.toPrecision(5); }
    if (el.words_per_sentence.toString().length > 6) { el.words_per_sentence = el.words_per_sentence.toPrecision(5); }
    if (el.lines_per_stanza.toString().length > 6) { el.lines_per_stanza = el.lines_per_stanza.toPrecision(5); }
    if (el.words_per_stanza.toString().length > 6) { el.words_per_stanza = el.words_per_stanza.toPrecision(5); }
    if (el.words_per_line.toString().length > 6) { el.words_per_line = el.words_per_line.toPrecision(5); }
    return Object.values(el);
  });

  frostData = frostData.map((el) => {
    let year_published = el.title.split('-')[0].trim();
    return Object.assign({year_published: year_published}, el);
  });

  corpusWordCount = corpusWordCount.map((el) => {
    return Object.values(el);
  });

  let theRoadNotTaken = Object.assign({},
    structData.find(function(o) { return o.title == "The Road Not Taken"; }),
    frostData.find(function(o) { return o.title == "1916 - The Road Not Taken"; })
  );

  /*****************
  ** FUNCTIONS
  *****************/
  let sort_by = function(field, reverse, primer){
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

  function generateSentimentData() {
    let f = frostData.sort(sort_by("year_published", false, parseInt));
    let sentimentScores = f.map((el) => {
      return {
        label: el.title,
        value: el.sentiment.document.score
      };
    });
    return [
      {
        key: "Sentiment Score",
        values: sentimentScores
      }
    ];
  }

  function updateStructureChart(property, reverse, primer, limit) {
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

  function generateBoxPlotData() {
    let total = 0;
    let f = frostData.filter((el) =>{
      return el.sentiment.document.score < 0;
    });
    f.forEach(function(el){
      total += el.sentiment.document.score;
    });
    let scoreList = f.map((el) => {
      return el.sentiment.document.score;
    });
    scoreList = scoreList.sort(function(a,b) { return a - b; });
    let q1 = scoreList[Math.ceil(0.25 * scoreList.length)-1];
    let q2 = scoreList[Math.ceil(0.5 * scoreList.length)-1];
    let q3 = scoreList[Math.ceil(0.75 * scoreList.length)-1];
    let iqr = q3 - q1;
    let whisker_low = q1 - 1.5*iqr;
    let whisker_high = q3 + 1.5*iqr
    let outliers = scoreList.filter((el)=> {
      if (el < whisker_low) { return true; }
      if (el > whisker_high) { return true; }
      return false;
    });
    let sample = {
      label: "Negative Sentiments Boxplot",
      values: {
        Q1: q1,
        Q2: q2,
        Q3: q3,
        whisker_low: whisker_low,
        whisker_high: whisker_high
      },
      outliers: outliers
    };
    console.log(sample);
    return [sample];
  }

  function initToneScores(poem) {
    let tones = Object.values(poem.document_tone.tone_categories);
    tones.forEach((tone)=>{
      tone.tones.forEach((el)=>{
        let percentage = el.score * 100;
        $('#'+el.tone_id+'-bar').css('width', percentage.toString() + "%");
        if (el.score > 0.5) {
          $('#'+el.tone_id+'-bar').addClass('progress-bar-success');
          $('#'+el.tone_id+'-bar-label').html("<em>"+ el.tone_name + ' (' + el.score.toPrecision(4) + ')' + "</em>");
        }
        else {
          $('#'+el.tone_id+'-bar').addClass('progress-bar-info');
          $('#'+el.tone_id+'-bar-label').html(el.tone_name + ' (' + el.score.toPrecision(4) + ')');
        }
      });
    });
  }

  /*****************
  ** INITIALIZATION
  *****************/

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

  nv.addGraph(function() {
    let sentimentChart = nv.models.discreteBarChart()
      .x(function(d) { return d.label })    //Specify the data accessors.
      .y(function(d) { return d.value })
      .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
      .showValues(false)      //...instead, show the bar value right on top of each bar.
      .showXAxis(false);
    sentimentChart.yAxis.tickFormat((d3.format('.5f')))
    let sentimentChartData = d3.select('#sentiment-d3 svg');
    sentimentChartData.datum(generateSentimentData())
        .transition().duration(500)
        .call(sentimentChart);
    nv.utils.windowResize(sentimentChart.update);
    return sentimentChart;
  });

  nv.addGraph(function() {
    var chart = nv.models.boxPlotChart()
        .x(function(d) { return d.label })
        .staggerLabels(true)
        .maxBoxWidth(100) // prevent boxes from being incredibly wide
        .yDomain([-0.8, 0.1])
        ;
    d3.select('#boxplot-d3 svg')
        .datum(generateBoxPlotData())
        .call(chart);
    nv.utils.windowResize(chart.update);
    return chart;
  });

  initToneScores(theRoadNotTaken);
  /*****************
  ** EVENT HANDLERS
  *****************/
  document.getElementById('btn1').addEventListener("click", function(event) {
    event.preventDefault();
    let limit = parseInt($('#limit').val());
    let sort = (parseInt($('#sort').val()) == 1) ? true : false;
    let prop = $('#property').val();
    updateStructureChart(prop, sort, parseFloat, limit);
  });
});
