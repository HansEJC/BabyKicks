function startup() {
  document.querySelector(`#addKick`).addEventListener(`click`, addKick);
  document.querySelector(`#undo`).addEventListener(`click`, undoKick);
  kicker();
}

function kicker(func, port) {
  let date = new Date();
  let kicks = port
    ? porter()
    : getKicks() || [date.getFullYear(), date.getMonth(), date.getDate(), 0];
  try {
    if (func === `add`) kicks.push([date, 1]);
    else if (func === `undo`) kicks.pop();
  } catch (e) { console.log(e); }
  localStorage.setItem(`kicks`, JSON.stringify(kicks));
  daily(kicks);
  liveKicks(kicks);
  pattern(kicks);
}

const addKick = () => kicker(`add`);
const undoKick = () => kicker(`undo`);

function getKicks() {
  let kicks = localStorage.getItem(`kicks`);
  document.querySelector(`#Backup`).value = kicks;
  return JSON.parse(kicks);
}

function porter() {
  let kicks = localStorage.getItem(`kicksimport`);
  try {
    kicks = JSON.parse(kicks);
    return kicks;
  } catch (e) {
    return getKicks();
  }
}

function daily(kicks) {
  let dailyObj = {}, count;
  kicks.forEach(kick => {
    let date = new Date(kick[0]);
    let day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    count = dailyObj[day] + 1 || 1;
    dailyObj[day] = count;
  });
  try {
    g1.destroy();
  } catch (e) { }
  let dailyKicks = Object.keys(dailyObj).map((key) => [new Date(key), dailyObj[key]]);
  dygPlot(dailyKicks, `graphdiv1`, `g1`);
  window[`days`] = dailyKicks.length;
}

function liveKicks(kicks) {
  try {
    g2.destroy();
  } catch (e) { }
  kicks = kicks.map(kick => [new Date(kick[0]), kick[1]]);
  dygPlot(kicks, `graphdiv2`, `g2`);
}

function pattern(kicks) {
  let dailyObj = {}, count;
  kicks.forEach(kick => {
    let date = new Date(kick[0]);
    let time = date.getHours();
    count = dailyObj[time] + 1 || 1;
    dailyObj[time] = count;
  });
  try {
    g3.destroy();
  } catch (e) { }
  let dailyKicks = Object.keys(dailyObj).map((key) => [+key, dailyObj[key] / days]);
  dygPlot(dailyKicks, `graphdiv3`, `g3`);
}

function dygPlot(kicks, div, g) {
  if (kicks.length < 1) return;
  window[g] = new Dygraph(
    document.getElementById(div),
    kicks,
    {
      xlabel: "Time",
      ylabel: "Kicks",
      labels: ['a', 'Kicks'],
      connectSeparatedPoints: true,
      includeZero: true,
      plotter: barChartPlotter,
      axes: {
        x: {
          axisLabelFormatter: function (y, gran, opts) {
            return y instanceof Date ? Dygraph.dateAxisLabelFormatter(y, gran, opts) : `${smoothdec(y, 0)}:00`;
          },
        },
        y: {
          axisLabelFormatter: function (y) {
            return smoothdec(y);
          },
        },
      }
    }          // options
  );
  window[g].ready(dygReady);
}

function dygReady() {
  setTimeout(function () {
    window.dispatchEvent(new Event('resize'));
  }, 500);
}

//Save the value function - save it to localStorage as (ID, VALUE)
function saveValue(e) {
  var val = e.value; // get the value.
  localStorage.setItem(`kicksimport`, val);
}

// This function draws bars for a single series. See
// multiColumnBarPlotter below for a plotter which can draw multi-series
// bar charts.
function barChartPlotter(e) {
  var ctx = e.drawingContext;
  var points = e.points;
  var y_bottom = e.dygraph.toDomYCoord(0);

  ctx.fillStyle = darkenColor(e.color);

  // Find the minimum separation between x-values.
  // This determines the bar width.
  var min_sep = Infinity;
  for (var i = 1; i < points.length; i++) {
    var sep = points[i].canvasx - points[i - 1].canvasx;
    if (sep < min_sep) min_sep = sep;
  }
  var bar_width = Math.floor(2.0 / 3 * min_sep);

  // Do the actual plotting2.
  for (var i = 0; i < points.length; i++) {
    var p = points[i];
    var center_x = p.canvasx;

    ctx.fillRect(center_x - bar_width / 2, p.canvasy,
      bar_width, y_bottom - p.canvasy);

    ctx.strokeRect(center_x - bar_width / 2, p.canvasy,
      bar_width, y_bottom - p.canvasy);
  }
}

// Darken a color
function darkenColor(colorStr) {
  // Defined in dygraph-utils.js
  var color = Dygraph.toRGB_(colorStr);
  color.r = Math.floor((255 + color.r) / 2);
  color.g = Math.floor((255 + color.g) / 2);
  color.b = Math.floor((255 + color.b) / 2);
  return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
}

var desired_range = null;
function approach_range() {
  if (!desired_range) return;
  // go halfway there
  var range = g2.xAxisRange();
  if (Math.abs(desired_range[0] - range[0]) < 60 &&
    Math.abs(desired_range[1] - range[1]) < 60) {
    g2.updateOptions({ dateWindow: desired_range });
    // (do not set another timeout.)
  } else {
    var new_range;
    new_range = [0.5 * (desired_range[0] + range[0]),
    0.5 * (desired_range[1] + range[1])];
    g2.updateOptions({ dateWindow: new_range });
    animate();
  }
}

const animate = function () {
  setTimeout(approach_range, 50);
};

const zoom = function (res) {
  var w = g2.xAxisRange();
  desired_range = [w[0], w[0] + res * 1000];
  animate();
};

const pan = function (dir) {
  var w = g2.xAxisRange();
  var scale = w[1] - w[0];
  var amount = scale * dir;
  desired_range = [w[0] + amount, w[1] + amount];
  animate();
};

function reset() {
  g2.updateOptions({
    dateWindow: null,
    valueRange: null
  });
}

startup();