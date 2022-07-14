let tiles = [];
const tileImages = [];

let grid = [];

const DIM = 64;

let needs_restart = false;
let prev_cell_collapsed = null;
let collapsed = [];
let backtrack_counter = {}

function preload() {
  // const path = 'rail';
  // for (let i = 0; i < 7; i++) {
  //   tileImages[i] = loadImage(`${path}/tile${i}.png`);
  // }

  const path = 'tiles/circuit-coding-train';
  for (let i = 0; i < 13; i++) {
    tileImages[i] = loadImage(`${path}/${i}.png`);
  }
}

function removeDuplicatedTiles(tiles) {
  const uniqueTilesMap = {};
  for (const tile of tiles) {
    const key = tile.edges.join(','); // ex: "ABB,BCB,BBA,AAA"
    uniqueTilesMap[key] = tile;
  }
  return Object.values(uniqueTilesMap);
}

function setup() {
  createCanvas(1000, 1000);
  //randomSeed(15);

  // tiles[0] = new Tile(tileImages[0], ['AAA', 'AAA', 'AAA', 'AAA']);
  // tiles[1] = new Tile(tileImages[1], ['ABA', 'ABA', 'ABA', 'AAA']);
  // tiles[2] = new Tile(tileImages[2], ['BAA', 'AAB', 'AAA', 'AAA']);
  // tiles[3] = new Tile(tileImages[3], ['BAA', 'AAA', 'AAB', 'AAA']);
  // tiles[4] = new Tile(tileImages[4], ['ABA', 'ABA', 'AAA', 'AAA']);
  // tiles[5] = new Tile(tileImages[5], ['ABA', 'AAA', 'ABA', 'AAA']);
  // tiles[6] = new Tile(tileImages[6], ['ABA', 'ABA', 'ABA', 'ABA']);

  // Loaded and created the tiles
  tiles[0] = new Tile(tileImages[0], ['AAA', 'AAA', 'AAA', 'AAA']);
  tiles[1] = new Tile(tileImages[1], ['BBB', 'BBB', 'BBB', 'BBB']);
  tiles[2] = new Tile(tileImages[2], ['BBB', 'BCB', 'BBB', 'BBB']);
  tiles[3] = new Tile(tileImages[3], ['BBB', 'BDB', 'BBB', 'BDB']);
  tiles[4] = new Tile(tileImages[4], ['ABB', 'BCB', 'BBA', 'AAA']);
  tiles[5] = new Tile(tileImages[5], ['ABB', 'BBB', 'BBB', 'BBA']);
  tiles[6] = new Tile(tileImages[6], ['BBB', 'BCB', 'BBB', 'BCB']);
  tiles[7] = new Tile(tileImages[7], ['BDB', 'BCB', 'BDB', 'BCB']);
  tiles[8] = new Tile(tileImages[8], ['BDB', 'BBB', 'BCB', 'BBB']);
  tiles[9] = new Tile(tileImages[9], ['BCB', 'BCB', 'BBB', 'BCB']);
  tiles[10] = new Tile(tileImages[10], ['BCB', 'BCB', 'BCB', 'BCB']);
  tiles[11] = new Tile(tileImages[11], ['BCB', 'BCB', 'BBB', 'BBB']);
  tiles[12] = new Tile(tileImages[12], ['BBB', 'BCB', 'BBB', 'BCB']);

  for (let i = 0; i < 12; i++) {
    tiles[i].index = i;
  }

  const initialTileCount = tiles.length;
  for (let i = 0; i < initialTileCount; i++) {
    let tempTiles = [];
    for (let j = 0; j < 4; j++) {
      tempTiles.push(tiles[i].rotate(j));
    }
    tempTiles = removeDuplicatedTiles(tempTiles);
    tiles = tiles.concat(tempTiles);
  }
  // console.log(tiles.length);

  // Generate the adjacency rules based on edges
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    tile.analyze(tiles);
  }

  startOver();
}

function startOver() {
  collapsed = []
  backtrack_counter = {}
  needs_restart = false;
  // Create cell for each spot on the grid
  for (let i = 0; i < DIM * DIM; i++) {
    grid[i] = new Cell(tiles.length, i);
  }
}

function checkValid(arr, valid) {
  //console.log(arr, valid);
  for (let i = arr.length - 1; i >= 0; i--) {
    // VALID: [BLANK, RIGHT]
    // ARR: [BLANK, UP, RIGHT, DOWN, LEFT]
    // result in removing UP, DOWN, LEFT
    let element = arr[i];
    // console.log(element, valid.includes(element));
    if (!valid.includes(element)) {
      arr.splice(i, 1);
    }
  }
  return arr;
  // console.log(arr);
  // console.log("----------");
}

function mousePressed() {
  if(mouseButton!==LEFT){
    return;
  }
  if(isLooping()){
      noLoop();
  }else{
    if(needs_restart){
      startOver();
    }
    loop();
  }
}

function draw() {
  background(0);

  const w = width / DIM;
  const h = height / DIM;
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let cell = grid[i + j * DIM];
      if (cell.collapsed) {
        let index = cell.options[0];
        image(tiles[index].img, i * w, j * h, w, h);
      } else {
        noFill();
        if(cell.no_pick){
          stroke(255, 204, 0);
        }else{
          stroke(33);
        }
        rect(i * w, j * h, w, h);
      }
    }
  }

  // Pick cell with least entropy
  let gridCopy = grid.slice();
  gridCopy = gridCopy.filter((a) => !a.collapsed);
  // console.table(grid);
  // console.table(gridCopy);

  if (gridCopy.length == 0) {
    return;
  }
  gridCopy.sort((a, b) => {
    return a.options.length - b.options.length;
  });

  let len = gridCopy[0].options.length;
  let stopIndex = 0;
  for (let i = 1; i < gridCopy.length; i++) {
    if (gridCopy[i].options.length > len) {
      stopIndex = i;
      break;
    }
  }

  if (stopIndex > 0) gridCopy.splice(stopIndex);
  const cell = random(gridCopy);
  const pick = random(cell.options);
  if (pick === undefined) {
    backtrack_counter[cell.index] = backtrack_counter?.[cell.index] ? backtrack_counter[cell.index]+1 : 1;
    // startOver();
    // console.log(`no pick for ${cell.index}, back track to ${prev_cell_collapsed}`);

    /* Hard Stop */
    // needs_restart = true;
    // cell.no_pick = true;
    // noLoop();
    // // draw();
    // return;

    /* Back Track */
    const BT_THRESHOLD = 9;
    let backtrack_i = -1;
    let backtrack = true
    while(backtrack && backtrack_i < collapsed.length){
      backtrack_i++;
      if(!collapsed.length){
        needs_restart = true;
        backtrack = false;
        continue;
      }
      let prev_c_index = collapsed.length - backtrack_i;
      if(prev_c_index >= collapsed.length){
        prev_c_index = collapsed.length - 1;
      }
      if(prev_c_index < 0){
        prev_c_index = 0;
      }

      let prev_index = collapsed?.[prev_c_index];
      let prev_cell = grid?.[prev_index];
      if(!prev_cell){
        console.warn('not found',{prev_index,backtrack_i,c_len:collapsed.length})
        backtrack = false;
        continue;
      }
      if(prev_cell){
        console.log('backtracking ', {
          backtrack_i,
          index:prev_cell.index,
          num_retries:backtrack_counter?.[prev_cell.index], 
          num_collapsed:collapsed.length
        })
        grid[prev_cell.index].collapsed = false;
        grid[prev_cell.index].options = new Array(tiles.length).fill(0).map((x, i) => i);

        backtrack_counter[prev_cell.index] = backtrack_counter?.[prev_cell.index] ? backtrack_counter[prev_cell.index]+1 : 1
        
        if(backtrack_counter[prev_cell.index] < BT_THRESHOLD){
          backtrack = false; // break loop if this cell hasn't been retried a bunch
          continue;
        }
        
        let in_c_arr = collapsed.indexOf(prev_cell.index)
        if(in_c_arr > -1){
          collapsed.splice(in_c_arr,1);
        }
      }
    }
    // debugger;
    cell.options = new Array(tiles.length).fill(0).map((x, i) => i);
    grid[cell.index].collapsed = false;
    let in_c_arr = collapsed.indexOf(cell.index)
    if(in_c_arr > -1){
      collapsed.splice(in_c_arr,1);
    }
    //return;
  }else{
    cell.collapsed = true;
    prev_cell_collapsed = cell.index;
    collapsed.push(cell.index);
    cell.options = [pick];
    // why is this diverging???
    // let actual = grid.filter(v => v.collapsed);
    // console.log(collapsed.length, actual.length);
    // if(collapsed.length != actual.length){
    //   let difference = collapsed
    //              .filter(x => !actual.includes(x));
    //   let diff2 = actual.filter(x => !collapsed.includes(x))
    //   debugger;
    // }
  }

  const nextGrid = [];
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let index = i + j * DIM;
      if (grid[index].collapsed) {
        nextGrid[index] = grid[index];
      } else {
        // if ZERO adjacent cells are collapsed, skip for now...
        let at_least_one_collapsed = false;
        for(neighbor of [
          j > 0 ? grid[i + (j - 1) * DIM] : null, // up
          i < DIM - 1 ? grid[i + 1 + j * DIM] : null, // right
          j < DIM - 1 ? grid[i + (j + 1) * DIM] : null, // down
          i > 0 ? grid[i - 1 + j * DIM] : null // left
        ]){
            if(neighbor?.collapsed){
              at_least_one_collapsed = true;
            }
        }
        if(!at_least_one_collapsed){
          nextGrid[index] = grid[index];
          continue;
        }
        let options = new Array(tiles.length).fill(0).map((x, i) => i);
        // Look up
        if (j > 0) {
          let up = grid[i + (j - 1) * DIM];
          let validOptions = [];
          // let ogValidOptions = [];
          for (let option of up.options) {
            let valid = tiles[option].down;
            // pre-filter dupes
            for(let presumed_valid of valid){
                if(!validOptions.includes(presumed_valid)){
                    validOptions.push(presumed_valid);
                }
            }
            // ogValidOptions = ogValidOptions.concat(valid);
          }
          // console.log('compare', {ogValidOptions, validOptions})
          options = checkValid(options, validOptions);
        }
        // Look right
        if (i < DIM - 1) {
          let right = grid[i + 1 + j * DIM];
          let validOptions = [];
          for (let option of right.options) {
            let valid = tiles[option].left;
            for(let presumed_valid of valid){
                if(!validOptions.includes(presumed_valid)){
                    validOptions.push(presumed_valid);
                }
            }
          }
          options = checkValid(options, validOptions);
        }
        // Look down
        if (j < DIM - 1) {
          let down = grid[i + (j + 1) * DIM];
          let validOptions = [];
          for (let option of down.options) {
            let valid = tiles[option].up;
            for(let presumed_valid of valid){
                if(!validOptions.includes(presumed_valid)){
                    validOptions.push(presumed_valid);
                }
            }
          }
          options = checkValid(options, validOptions);
        }
        // Look left
        if (i > 0) {
          let left = grid[i - 1 + j * DIM];
          let validOptions = [];
          for (let option of left.options) {
            let valid = tiles[option].right;
            for(let presumed_valid of valid){
                if(!validOptions.includes(presumed_valid)){
                    validOptions.push(presumed_valid);
                }
            }
          }
          options = checkValid(options, validOptions);
        }

        // I could immediately collapse if only one option left?
        nextGrid[index] = new Cell(options, index);
        // if(options.length === 1){
        //   nextGrid[index].collapsed = true;
        //   collapsed.push(index);
        // }
      }
    }
  }

  grid = nextGrid;
}
