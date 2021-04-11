"use strict";
(new URL(document.location)).searchParams.forEach((x, y) => {
  localStorage.setItem(y, x);
});
//Toggle Dark Mode
(function () {
  //Add toggle to page
  const switchLabel = document.createElement('label');
  const toggLabel = document.createElement('label');
  const checkBox = document.createElement('input');
  const spanny = document.createElement('span');
  switchLabel.classList.add('switch');
  checkBox.id = "DarkToggle";
  checkBox.type = "checkbox";
  spanny.classList.add('slider', 'round');
  toggLabel.innerText = "Dark Mode";
  toggLabel.classList.add('toggLabel');
  toggLabel.htmlFor = "DarkToggle";
  switchLabel.appendChild(checkBox);
  switchLabel.appendChild(spanny);
  document.querySelector("#header").appendChild(switchLabel);
  document.querySelector("#header").appendChild(toggLabel);

  // Use matchMedia to check the user preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const darkToggle = document.querySelector("#DarkToggle");

  //Toggle to change mode manually
  darkToggle.addEventListener('change', function () { toggleDarkTheme(darkToggle.checked); saveCheckbox(this); });

  toggleDarkTheme(prefersDark.matches && (getSavedValue(darkToggle.id) != "false"));
  if (getSavedValue(darkToggle.id) == "true") toggleDarkTheme(true); //iif statement as it would turn off if false
  //if ((prefersDark.matches || (getSavedValue(darkToggle.id) == "true")) && !darkToggle.checked) darkToggle.click();

  // Listen for changes to the prefers-color-scheme media query
  prefersDark.addListener((mediaQuery) => toggleDarkTheme(mediaQuery.matches));

  // Add or remove the "dark" class based on if the media query matches
  function toggleDarkTheme(shouldAdd) {
    document.body.classList.toggle('dark', shouldAdd);
    darkToggle.checked = shouldAdd;
  }
})();

function toggleNav(e) {
  const x = document.getElementById("myTopnav");
  try {
    if (e.target.parentElement.className === "topnav") {
      x.className += " responsive";
    } else {
      x.className = "topnav";
    }
  } catch (err) { x.className = "topnav" }
}
document.addEventListener('click', toggleNav);

function navBar() {
  const navbar = document.querySelector('#myTopnav');
  navbar.innerHTML = `
      <a href="#" style="font-size:15px;" class="icon">&#9776;</a>
      <div class="dropdown">
        <a href='#' class="dropbtn heh">Games</a>
        <div class="dropdown-content">
          <a href='dobble.html'>Dobble</a>
          <a href='memory.html'>Simon</a>
          <a href='index.html'>TRex</a>
          <a href='tictactoe.html'>TicTacToe</a>
          <a href='mole.html'>Whack a Mole</a>
        </div>
      </div>
      <div class="dropdown">
        <a href='#' class="dropbtn heh">Tools</a>
        <div class="dropdown-content">
          <a href='circuit.html'>Circuit Simulator</a>
          <a href='csv.html'>CSV Plotter</a>
          <a href='earth.html'>Earthing Calculation Tools</a>
          <a href='soil.html'>Earthing Surveys</a>
          <a href='tools.html'>Electrical Engineering Tools</a>
          <a href='emc.html'>EMC Calculations</a>
          <a href='mortgage.html'>Loan Calculator</a>
        </div>
      </div>
      <div class="dropdown">
        <a href='#' class="dropbtn heh">Railway</a>
        <div class="dropdown-content">
          <a href='relay.html'>Distance Protection Fault Plotter</a>
          <a href='fault.html'>Railway Faults</a>
          <a href='railvolts.html'>Railway Voltages</a>
        </div>
      </div>
      <a href='op.html'>Orion Park</a>
      <a href='javascript:helpPage()'>Help</a>
    `;
  document.querySelectorAll('.heh').forEach(function (item) { return item.addEventListener('click', randomPage) });
}

//navBar();
let test;
const navs = ['Games', 'Tools', 'Railway'];
const randomChild = function (len) { return Math.floor(Math.random() * len) };
function randomPage(e) {
  test = e;
  if (navs.some(function (nav) { return e.target.innerHTML.includes(nav) })) {
    let nodeLen = randomChild(e.target.parentElement.children[1].querySelectorAll('a').length)
    e.target.parentElement.children[1].querySelectorAll('a')[nodeLen].click();
  }
  else return;
}

if ("serviceWorker" in navigator) {
  //Adds manifest and stuff
  let head = document.head;
  let mani = document.createElement("link"), apple = document.createElement("link"), theme = document.createElement("meta");
  mani.rel = "manifest"; apple.rel = "apple-touch-icon"; theme.name = "theme-color";
  mani.href = "manifest.json"; apple.href = "images/apple-icon-180.png"; theme.content = "#800080";
  head.appendChild(mani); head.appendChild(apple); head.appendChild(theme);

  //Makes website available offline
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("sw.js")
      .then(res => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err));

    let deferredPrompt;
    let body = document.querySelector("#main");
    let btn = document.createElement("button");
    btn.classList.add("add-button", "button");
    btn.innerText = "Add to home screen";
    body.appendChild(btn);
    const addBtn = document.querySelector('.add-button');
    addBtn.style.display = 'none';

    //Enable Progressive Web Apps on supported desktop browsers
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      // Update UI to notify the user they can add to home screen
      addBtn.style.display = 'block';

      addBtn.addEventListener('click', (e) => {
        // hide our user interface that shows our A2HS button
        addBtn.style.display = 'none';
        // Show the prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
          } else {
            console.log('User dismissed the A2HS prompt');
          }
          deferredPrompt = null;
        });
      });
    });
  })
}

//function to resize plot and copy to clipboard
function clippy(x, y) {
  let offset = document.querySelector('#graphdiv3').offsetTop;
  document.querySelector('#graphdiv3').setAttribute(`style`, `height:${y}px !important; width:${x}px !important; max-height:${y}px; max-width:${x}px;`);
  window.dispatchEvent(new Event('resize'));
  for (var j = 0; j < 3; j++) {  //weird way to make it actually work
    html2canvas(document.querySelector("#graphdiv3"), {
      y: offset,
      //scrollY: -window.scrollY,
      scrollX: 0,
      scrollY: 0,
      height: y + 10,
      width: x + 10,
    }).then(canvas => {
      if (typeof (navigator.clipboard) != 'undefined') {
        canvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]));
      }
      else {
        document.querySelector("#graphdiv3").innerHTML = '';
        document.querySelector("#graphdiv3").appendChild(canvas);
      }
    });
  }
  if (typeof (navigator.clipboard) == 'undefined') {
    let htmltext = (navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes("Edg")) ? "<br><br><a href=chrome://flags/#unsafely-treat-insecure-origin-as-secure>Auto copy to clipboard not supported in http. Copy this link and open in new tab to add this site as trusted to enable.</a>" : "<br><br><a>Auto copy to clipboard not supported. Right click plot and copy as image.</a>";
    let article = document.querySelector('article');
    if (article.lastChild.nodeName != "A") article.innerHTML += htmltext;
  }
}

//get the saved value function - return the value of "v" from localStorage.
function getSavedValue  (v){
  if (!localStorage.getItem(v)) {
    return "";// You can change this to your defualt value.
  }
  return localStorage.getItem(v);
}

function saveCheckbox(e){
  e.checkbox = true;
  document.querySelectorAll('input[type="checkbox"]').forEach(rad => localStorage.setItem(rad.id,rad.checked));
}

const smoothdec = (a, b = 2) => +(parseFloat(a).toFixed(b)); //fix broken decimals
document.documentElement.setAttribute('lang', navigator.language); //add language to html