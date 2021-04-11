function startup() {
  document.querySelector(`#addKick`).addEventListener(`click`, addKick);
  document.querySelector(`#undo`).addEventListener(`click`, undoKick);
}

function kicker(bool) {
  let kicks = getKicks() || [];
  try {
    bool ? kicks.push([new Date(), 1]) : kicks.pop();
  } catch (e) { console.log(e); }
  localStorage.setItem(`kicks`, JSON.stringify(kicks));
  dygPlot(kicks);
}

const addKick = () => kicker(true);
const undoKick = () => kicker(false);

function getKicks() {
  return JSON.parse(localStorage.getItem(`kicks`));
}

function dygPlot(kicks) {
  try {
    if (typeof g3 !== 'undefined') g3.destroy();
  } catch (e) { console.log(e); }
  if (kicks.length < 1) return;
  kicks = kicks.map(kick => [new Date(kick[0]), kick[1]]);
  g3 = new Dygraph(
    document.getElementById("graphdiv3"),
    kicks,
    {
      legend: 'always',
      xlabel: "Distance (m)",
      connectSeparatedPoints: true,
      axes: {
        x: {
          axisLabelFormatter: function (y, gran, opts) {
            return Dygraph.dateAxisLabelFormatter(y, gran, opts);
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
  g3.ready(dygReady);
}


function dygReady() {
  setTimeout(function () {
    window.dispatchEvent(new Event('resize'));
  }, 500);
}

startup();