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

  function generateBoxPlotData(label, scoreList) {
    scoreList = scoreList.sort(function(a,b) { return a - b; });
    let q1 = scoreList[Math.ceil(0.25 * scoreList.length)-1];
    let q2 = scoreList[Math.ceil(0.5 * scoreList.length)-1];
    let q3 = scoreList[Math.ceil(0.75 * scoreList.length)-1];
    let iqr = q3 - q1;
    let whisker_low = q1 - (1.5*iqr);
    let whisker_high = q3 + (1.5*iqr);
    let outliers = scoreList.filter((el)=> {
      if (el < whisker_low) { return true; }
      if (el > whisker_high) { return true; }
      return false;
    });
    return {
      label: label,
      values: {
        Q1: q1,
        Q2: q2,
        Q3: q3,
        whisker_low: whisker_low,
        whisker_high: whisker_high
      },
      outliers: outliers
    };
  }

  function initToneScores(poem) {
    let tones = Object.values(poem.document_tone.tone_categories);
    frostData = frostData.sort(sort_by("year_published", false, parseInt));
    let poemTitles = frostData.map((el) => {
      return el.title;
    });
    poemTitles.forEach((title) =>{
      $('#poem-title').append("<option value=\"" + title + "\">" + title + "</option>");
    });
    tones.forEach((tone)=>{
      tone.tones.forEach((el)=>{
        let percentage = el.score * 100;
        $('#'+el.tone_id+'-bar').css('width', percentage.toString() + "%");
        if (el.score > 0.5) {
          $('#'+el.tone_id+'-bar').addClass('progress-bar progress-bar-success');
          $('#'+el.tone_id+'-bar-label').html("<em>"+ el.tone_name + ' (' + el.score.toPrecision(4) + ' - Likely)' + "</em>");
        }
        else {
          $('#'+el.tone_id+'-bar').addClass('progress-bar progress-bar-info');
          $('#'+el.tone_id+'-bar-label').html(el.tone_name + ' (' + el.score.toPrecision(4) + ' - Unlikely)');
        }
      });
    });
  }

  function toggleToneScores(poemTitle) {
    poem = frostData.find(function(o) { return o.title == poemTitle; });
    initToneScores(poem);
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
    let f = frostData.filter((el) =>{
      return el.sentiment.document.score < 0;
    });
    let scoreList = f.map((el) => {
      return el.sentiment.document.score;
    });
    let data = [];
    data.push(generateBoxPlotData("Negative Sentiments Boxplot", scoreList));
    d3.select('#boxplot-d3 svg')
        .datum(data)
        .call(chart);
    nv.utils.windowResize(chart.update);
    return chart;
  });

  function toneBoxPlots() {
    let tones = {
      emotion: {
        anger: [],
        disgust: [],
        fear: [],
        joy: [],
        sadness: []
      },
      social: {
        analytical: [],
        confident: [],
        tentative: []
      },
      language: {
        openness: [],
        conscientiousness: [],
        extraversion: [],
        agreeableness: [],
        emotional_range: []
      }
    };
    frostData.forEach((el) => {
      tones.emotion.anger.push(el.document_tone.tone_categories[0].tones[0]);
      tones.emotion.disgust.push(el.document_tone.tone_categories[0].tones[1]);
      tones.emotion.fear.push(el.document_tone.tone_categories[0].tones[2]);
      tones.emotion.joy.push(el.document_tone.tone_categories[0].tones[3]);
      tones.emotion.sadness.push(el.document_tone.tone_categories[0].tones[4]);
      tones.social.analytical.push(el.document_tone.tone_categories[1].tones[0]);
      tones.social.confident.push(el.document_tone.tone_categories[1].tones[1]);
      tones.social.tentative.push(el.document_tone.tone_categories[1].tones[2]);
      tones.language.openness.push(el.document_tone.tone_categories[2].tones[0]);
      tones.language.conscientiousness.push(el.document_tone.tone_categories[2].tones[1]);
      tones.language.extraversion.push(el.document_tone.tone_categories[2].tones[2]);
      tones.language.agreeableness.push(el.document_tone.tone_categories[2].tones[3]);
      tones.language.emotional_range.push(el.document_tone.tone_categories[2].tones[4]);
    });

    tones.emotion.anger = generateBoxPlotData('Anger Tone Boxplot', tones.emotion.anger.map((el)=>{return el.score;}));
    tones.emotion.disgust = generateBoxPlotData('Disgust Tone Boxplot', tones.emotion.disgust.map((el)=>{return el.score;}));
    tones.emotion.fear = generateBoxPlotData('Fear Tone Boxplot', tones.emotion.fear.map((el)=>{return el.score;}));
    tones.emotion.joy = generateBoxPlotData('Joy Tone Boxplot', tones.emotion.joy.map((el)=>{return el.score;}));
    tones.emotion.sadness = generateBoxPlotData('Sadness Tone Boxplot', tones.emotion.sadness.map((el)=>{return el.score;}));
    tones.social.analytical = generateBoxPlotData('Analytical Tone Boxplot', tones.social.analytical.map((el)=>{return el.score;}));
    tones.social.confident = generateBoxPlotData('Confident Tone Boxplot', tones.social.confident.map((el)=>{return el.score;}));
    tones.social.tentative = generateBoxPlotData('Tentative Tone Boxplot', tones.social.tentative.map((el)=>{return el.score;}));
    tones.language.openness = generateBoxPlotData('Disgust Tone Boxplot', tones.language.openness.map((el)=>{return el.score;}));
    tones.language.conscientiousness = generateBoxPlotData('Conscientiousness Tone Boxplot', tones.language.conscientiousness.map((el)=>{return el.score;}));
    tones.language.extraversion = generateBoxPlotData('Extraversion Tone Boxplot', tones.language.extraversion.map((el)=>{return el.score;}));
    tones.language.agreeableness = generateBoxPlotData('Agreeableness Tone Boxplot', tones.language.agreeableness.map((el)=>{return el.score;}));
    tones.language.emotional_range = generateBoxPlotData('Emotional Range Tone Boxplot', tones.language.emotional_range.map((el)=>{return el.score;}));

    let data1 = [];
    let selector1 = '#emotion_tone-d3';
    data1.push(tones.emotion.anger);
    data1.push(tones.emotion.disgust);
    data1.push(tones.emotion.fear);
    data1.push(tones.emotion.joy);
    data1.push(tones.emotion.sadness);
    let data2 = [];
    let selector2 = '#language_tone-d3';
    data2.push(tones.language.openness);
    data2.push(tones.language.conscientiousness);
    data2.push(tones.language.extraversion);
    data2.push(tones.language.agreeableness);
    data2.push(tones.language.emotional_range);
    let data3 = [];
    let selector3 = '#social_tone-d3';
    data3.push(tones.social.analytical);
    data3.push(tones.social.confident);
    data3.push(tones.social.tentative);

    nv.addGraph(function() {
        var chart = nv.models.boxPlotChart()
            .x(function(d) { return d.label })
            .staggerLabels(true)
            .maxBoxWidth(100) // prevent boxes from being incredibly wide
            .yDomain([-1.00, 1.00]);

        d3.select(selector1 + ' svg')
            .datum(data1)
            .call(chart);
        nv.utils.windowResize(chart.update);

        return chart;
    });

    nv.addGraph(function() {
        var chart = nv.models.boxPlotChart()
            .x(function(d) { return d.label })
            .staggerLabels(true)
            .maxBoxWidth(100) // prevent boxes from being incredibly wide
            .yDomain([-1.00, 1.00]);

        d3.select(selector2 + ' svg')
            .datum(data2)
            .call(chart);
        nv.utils.windowResize(chart.update);

        return chart;
    });

    nv.addGraph(function() {
        var chart = nv.models.boxPlotChart()
            .x(function(d) { return d.label })
            .staggerLabels(true)
            .maxBoxWidth(100) // prevent boxes from being incredibly wide
            .yDomain([-1.00, 1.00]);

        d3.select(selector3 + ' svg')
            .datum(data3)
            .call(chart);
        nv.utils.windowResize(chart.update);

        return chart;
    });
  }

  initToneScores(theRoadNotTaken);
  toneBoxPlots();
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
  document.getElementById('poem-title').addEventListener("change", function(event) {
    event.preventDefault();
    let poemTitle = $('#poem-title').val();
    $('.progress-bar').removeClass();
    toggleToneScores(poemTitle);
  });
});
