let prev_bt_mode = localStorage.getItem('backtrack_mode') || 'local';
let BACKTRACK_MODE = document.getElementById('backtrack_mode').value;

let prev_set = localStorage.getItem('selected_set');
if(prev_set){
  document.getElementById('set_selector').value = prev_set;
}
let selected_set_key = document.getElementById('set_selector').value;
let tiles = [];
let tileImages = [];

let grid = [];
let IS_BACKTRACKING = false
let backtrack_started_at = null
let collapsed_at_backtrack_start = null;
let latest_uncollapsed_cell = null;
let SHOW_NUMS = false
let SHOW_ENTROPY = false;

// seamless mode
let DEFAULT_EMPTY_OPTIONS_ARRAY = [];
// TODO: make user alterable // responsive // support non-grid
width = 640
height = 640

let prev_seamless = JSON.parse(localStorage.getItem('seamless')) ?? false
// console.log({prev_seamless})
document.getElementById('seamless').toggleAttribute('checked',prev_seamless)
let WRAP_AROUND = document.getElementById('seamless').checked;

let prev_delay = JSON.parse(localStorage.getItem('delay'));
if(prev_delay){
  document.getElementById('delay').value = prev_delay;
}
let GLOBAL_DELAY = parseInt(document.getElementById('delay').value);

let prev_dim = localStorage.getItem('tile-size');
if(prev_dim){
  prev_dim = JSON.parse(prev_dim);
  document.getElementById('tile-size').value = prev_dim < 256 ? prev_dim : 256;
}

let DIM = document.getElementById('tile-size').value;
DIM=parseInt(DIM);
let w = width / DIM;
let h = height / DIM;

document
  .getElementById("tile-size")
  .addEventListener("change", function (event) {
    DIM = parseInt(event.target.value);
    w = width / DIM;
    h = height / DIM;
    startOver();
    localStorage.setItem("tile-size", DIM);
  });

document.getElementById("delay").addEventListener("change", function (event) {
  GLOBAL_DELAY = event.target.value;
  localStorage.setItem("delay", GLOBAL_DELAY);
});

document
  .getElementById("seamless")
  .addEventListener("change", function (event) {
    WRAP_AROUND = event.target.checked;
    localStorage.setItem("seamless", WRAP_AROUND);
    startOver();
  });

document.getElementById("debug").addEventListener("change", function (event) {
  // debug = event.target.checked;
  SHOW_NUMS = event.target.checked;
  // localStorage.setItem('debug', debug);
  // startOver();
});

document
  .getElementById("set_selector")
  .addEventListener("change", function (event) {
    selected_set_key = event.target.value;
    localStorage.setItem("selected_set", selected_set_key);
    selected_set = tile_sets?.[selected_set_key] ?? tile_sets.plants;
    loadTiles();
    startOver();
  });

document.getElementById("backtrack_mode").addEventListener("change", function (event){
    BACKTRACK_MODE = event.target.value;
    localStorage.setItem("backtrack_mode", BACKTRACK_MODE);
    resetBacktracker();
    // startOver();
});