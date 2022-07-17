let tiles = [];
const tileImages = [];

let grid = [];

// seamless mode
let DEFAULT_EMPTY_OPTIONS_ARRAY = [];
width = 800
height = 800

let prev_seamless = JSON.parse(localStorage.getItem('seamless')) ?? false
console.log({prev_seamless})
document.getElementById('seamless').toggleAttribute('checked',prev_seamless)
let WRAP_AROUND = document.getElementById('seamless').checked;

let prev_delay = localStorage.getItem('delay');
if(prev_delay){
  document.getElementById('delay').value = prev_delay;
}
let GLOBAL_DELAY = parseInt(document.getElementById('delay').value);

let prev_dim = localStorage.getItem('tile-size');
if(prev_dim){
  document.getElementById('tile-size').value = prev_dim;
}

let DIM = document.getElementById('tile-size').value;
DIM=parseInt(DIM);
let w = width / DIM;
let h = height / DIM;

document.getElementById('tile-size').addEventListener('change', function(event) {
  DIM = parseInt(event.target.value);
  w = width / DIM;
  h = height / DIM;
  startOver();
  localStorage.setItem('tile-size', DIM);
});

document.getElementById('delay').addEventListener('change', function(event) {
  GLOBAL_DELAY = event.target.value;
  localStorage.setItem('delay', GLOBAL_DELAY);
});

document.getElementById('seamless').addEventListener('change', function(event) {
  WRAP_AROUND = event.target.checked;
  localStorage.setItem('seamless', WRAP_AROUND);
  startOver();
});

let needs_restart = false;
// let prev_cell_collapsed = null;

// track the order in which cells collapsed
let collapsed = [];
// track how many times we've retried a cell to know if we should stop backtracking or keep backtracking further
let backtrack_counter = {}
// let pick_counter = {}
let did_last_draw = false;

function preload() {
  // const path = 'rail';
  // for (let i = 0; i < 7; i++) {
  //   tileImages[i] = loadImage(`${path}/tile${i}.png`);
  // }

  let tile_sets = {
    squiggles: {
      max_id: 62,
      path: 'jake',
    },
    plants: {
      max_id: 11,
      path: 'plants',
    },
    circuits: {
      max_id: 7,
      path: 'circuit-coding-train'
    }
  }

  const selected_set = tile_sets.plants;
  const path = `tiles/${selected_set.path}`;
  for (let i = 0; i <= selected_set.max_id; i++) {
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

let seed = 1;
function setup() {
  pixelDensity(4);
  createCanvas(800, 800);
  drawingContext.imageSmoothingEnabled = false
  noSmooth();

  randomSeed(seed);

  // tiles[0] = new Tile(tileImages[0], ['AAA', 'AAA', 'AAA', 'AAA']);
  // tiles[1] = new Tile(tileImages[1], ['ABA', 'ABA', 'ABA', 'AAA']);
  // tiles[2] = new Tile(tileImages[2], ['BAA', 'AAB', 'AAA', 'AAA']);
  // tiles[3] = new Tile(tileImages[3], ['BAA', 'AAA', 'AAB', 'AAA']);
  // tiles[4] = new Tile(tileImages[4], ['ABA', 'ABA', 'AAA', 'AAA']);
  // tiles[5] = new Tile(tileImages[5], ['ABA', 'AAA', 'ABA', 'AAA']);
  // tiles[6] = new Tile(tileImages[6], ['ABA', 'ABA', 'ABA', 'ABA']);

  // Loaded and created the tiles
  // tiles[0] = new Tile(tileImages[0], ['AAA', 'AAA', 'AAA', 'AAA']);
  // tiles[1] = new Tile(tileImages[1], ['BBB', 'BBB', 'BBB', 'BBB']);
  // tiles[2] = new Tile(tileImages[2], ['BBB', 'BCB', 'BBB', 'BBB']);
  // tiles[3] = new Tile(tileImages[3], ['BBB', 'BDB', 'BBB', 'BDB']);
  // tiles[4] = new Tile(tileImages[4], ['ABB', 'BCB', 'BBA', 'AAA']);
  // tiles[5] = new Tile(tileImages[5], ['ABB', 'BBB', 'BBB', 'BBA']);
  // tiles[6] = new Tile(tileImages[6], ['BBB', 'BCB', 'BBB', 'BCB']);
  // tiles[7] = new Tile(tileImages[7], ['BDB', 'BCB', 'BDB', 'BCB']);
  // tiles[8] = new Tile(tileImages[8], ['BDB', 'BBB', 'BCB', 'BBB']);
  // tiles[9] = new Tile(tileImages[9], ['BCB', 'BCB', 'BBB', 'BCB']);
  // tiles[10] = new Tile(tileImages[10], ['BCB', 'BCB', 'BCB', 'BCB']);
  // tiles[11] = new Tile(tileImages[11], ['BCB', 'BCB', 'BBB', 'BBB']);
  // tiles[12] = new Tile(tileImages[12], ['BBB', 'BCB', 'BBB', 'BCB']);

  // squiggle set:
  // tiles.push( new Tile(0, ['AAA', 'AAA', 'AAA', 'AAA']) );
  // tiles.push( new Tile(1, ['ABA', 'AAA', 'AAA', 'ABA']) );
  // tiles.push( new Tile(2, ['ABA', 'ABA', 'ABA', 'ABA']) );
  // tiles.push( new Tile(3, ['AAB', 'BAA', 'AAB', 'BAA']) );
  // tiles.push( new Tile(4, ['BAC', 'CAB', 'BAC', 'CAB']) );
  // tiles.push( new Tile(5, ['BAC', 'CAB', 'BAC', 'CAB']) );
  // tiles.push( new Tile(6, ['BAC', 'CAC', 'CAB', 'BAB']) );
  // tiles.push( new Tile(7, ['BAA', 'AAA', 'AAB', 'BAB']) );
  // tiles.push( new Tile(8, ['CAA', 'AAA', 'AAC', 'CAC']) );
  // tiles.push( new Tile(9, ['ABA', 'AAA', 'AAB', 'BAA']) );
  // tiles.push( new Tile(10, ['ABA', 'AAC', 'CAB', 'BAA']) );
  // tiles.push( new Tile(11, ['ABA', 'ABA', 'AAA', 'ABA']) );
  // tiles.push( new Tile(12, ['ABA', 'ABB', 'BAB', 'BBA']) );
  // tiles.push( new Tile(13, ['BBB', 'BBB', 'BBB', 'BBB']) );
  // tiles.push( new Tile(14, ['ABA', 'AAB', 'BAB', 'BAA']) );
  // tiles.push( new Tile(15, ['BAA', 'AAA', 'AAA', 'AAB']) );
  // tiles.push( new Tile(16, ['BAA', 'AAB', 'BAA', 'AAB']) );
  // tiles.push( new Tile(17, ['BAA', 'AAB', 'BAB', 'BAB']) );
  // tiles.push( new Tile(18, ['BAB', 'BAB', 'BAB', 'BAB']) );
  // tiles.push( new Tile(19, ['BAB', 'BAB', 'BAB', 'BAB']) );
  // tiles.push( new Tile(20, ['ABA', 'AAA', 'AAB', 'BBA']) );
  // tiles.push( new Tile(21, ['BBA', 'AAA', 'ABB', 'BBB']) );
  // tiles.push( new Tile(22, ['BBA', 'AAA', 'ABB', 'BBB']) );
  // tiles.push( new Tile(23, ['BBA', 'AAA', 'AAA', 'ABB']) );
  // tiles.push( new Tile(24, ['ABA', 'AAA', 'AAA', 'ABA']) );
  // // tiles.push( new Tile(25, ['BBA', 'AAA', 'AAA', 'AAA']) );
  // tiles.push( new Tile(26, ['ABA', 'ABA', 'ABA', 'ABA']) );
  // tiles.push( new Tile(27, ['ABA', 'ACA', 'ABA', 'ACA']) );
  // tiles.push( new Tile(28, ['ACA', 'ACA', 'ACA', 'ACA']) );
  // tiles.push( new Tile(29, ['ACA', 'ABA', 'ACA', 'ABA']) );
  // tiles.push( new Tile(30, ['ACA', 'AAA', 'ACA', 'AAA']) );
  // tiles.push( new Tile(31, ['ABA', 'AAA', 'ABA', 'AAA']) );
  // tiles.push( new Tile(32, ['AAC', 'AAA', 'AAC', 'AAA']) );
  // tiles.push( new Tile(33, ['CAC', 'CAC', 'CAC', 'CAC']) );
  // tiles.push( new Tile(34, ['ACA', 'ACA', 'ACA', 'ACA']) );
  // tiles.push( new Tile(35, ['ACA', 'AAA', 'AAA', 'ACA']) );
  // tiles.push( new Tile(36, ['ACA', 'ACA', 'ACA', 'ACA']) );
  // tiles.push( new Tile(37, ['ABA', 'ABA', 'ABA', 'ABA']) );
  // tiles.push( new Tile(38, ['BAB', 'BAB', 'BAB', 'BAB']) );
  // tiles.push( new Tile(39, ['CAC', 'CAC', 'CAC', 'CAC']) );
  // tiles.push( new Tile(40, ['ABA', 'AAB', 'BBB', 'BAA']) );
  // tiles.push( new Tile(41, ['ABA', 'AAA', 'BCB', 'AAA']) );
  // tiles.push( new Tile(42, ['ACA', 'AAA', 'CBC', 'AAA']) );
  // tiles.push( new Tile(43, ['ACA', 'AAA', 'CCC', 'AAA']) );
  // tiles.push( new Tile(44, ['CCC', 'AAA', 'CCC', 'AAA']) );
  // tiles.push( new Tile(45, ['BBB', 'AAA', 'BBB', 'AAA']) );
  // tiles.push( new Tile(46, ['BAA', 'AAA', 'AAB', 'AAA']) );
  // tiles.push( new Tile(47, ['BAB', 'AAA', 'BAB', 'AAA']) );
  // tiles.push( new Tile(48, ['AAA', 'BAA', 'AAA', 'AAB']) );
  // tiles.push( new Tile(49, ['AAA', 'BAA', 'AAA', 'AAB']) );
  // tiles.push( new Tile(50, ['ABA', 'AAA', 'ABA', 'AAA']) );
  // tiles.push( new Tile(51, ['ABA', 'AAA', 'ABA', 'AAA']) );
  // tiles.push( new Tile(52, ['ABA', 'AAA', 'ABA', 'AAA']) );
  // tiles.push( new Tile(53, ['CCC', 'ABA', 'CCC', 'ABA']) );
  // tiles.push( new Tile(54, ['CCC', 'ABA', 'CCC', 'ABA']) );
  // tiles.push( new Tile(55, ['CCC', 'CCC', 'AAA', 'AAA']) );
  // tiles.push( new Tile(56, ['CCC', 'CAC', 'CCA', 'AAA']) );
  // tiles.push( new Tile(57, ['AAC', 'CAA', 'AAA', 'AAA']) );
  // tiles.push( new Tile(58, ['CAC', 'CAA', 'AAA', 'AAA']) );
  // tiles.push( new Tile(59, ['AAA', 'CCC', 'AAA', 'ABA']) );
  // tiles.push( new Tile(60, ['AAA', 'CAC', 'AAA', 'ABA']) );
  // tiles.push( new Tile(61, ['CCC', 'AAA', 'CAC', 'AAA']) );
  // tiles.push( new Tile(62, ['CCC', 'AAA', 'CAC', 'AAA']) );

  // plant set
  tiles.push( new Tile(0,  ['AAA', 'AAA', 'AAA', 'AAA']) ); // 0,0,0,0
  tiles.push( new Tile(1,  ['ABA', 'AAA', 'AAA', 'AAA']) ); // 1,0,0,0
  tiles.push( new Tile(2,  ['ABA', 'AAA', 'ABA', 'AAA']) ); // 1,0,1,0
  tiles.push( new Tile(3,  ['AAA', 'AAA', 'ABA', 'AAA']) ); // 0,0,1,0
  tiles.push( new Tile(4,  ['ABA', 'AAA', 'ABA', 'AAA']) ); // 1,0,1,0
  tiles.push( new Tile(5,  ['ABA', 'AAA', 'ABA', 'AAA']) ); // 1,0,1,0
  tiles.push( new Tile(6,  ['ABA', 'AAA', 'ABA', 'AAA']) ); // 1,0,1,0
  tiles.push( new Tile(7,  ['ABA', 'AAA', 'AAA', 'ABA']) ); // 1,0,0,1
  tiles.push( new Tile(8,  ['ABA', 'ABA', 'AAA', 'AAA']) ); // 1,1,0,0
  tiles.push( new Tile(9,  ['ABA', 'AAA', 'ABA', 'ABA']) ); // 1,0,1,1
  tiles.push( new Tile(10, ['ABA', 'ABA', 'ABA', 'AAA']) ); // 1,1,1,0
  tiles.push( new Tile(11, ['ABA', 'ABA', 'ABA', 'ABA']) ); // 1,1,1,1

  const ROTATIONS_ENABLED = false;

  for (let i = 0; i < tiles.length; i++) {
    tiles[i].index = i;
  }

  if(ROTATIONS_ENABLED){
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
  }

  // Generate the adjacency rules based on edges
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    tile.analyze(tiles);
  }

  console.table(tiles);
  // debugger;

  startOver();

  // let tickGrid = function(){
  //   if(isLooping()){
  //     updateGrid();
  //   }
  //   requestAnimationFrame(tickGrid)
  // }
  // tickGrid();
}

function startOver() {
  seed++;
  console.log('seed now',seed);
  randomSeed(seed);
  num_updates = 0;
  collapsed = []
  backtrack_counter = {}
  needs_restart = false;
  did_last_draw = false;

  // Create cell for each spot on the grid
  // for (let i = 0; i < DIM * DIM; i++) {
  //   grid[i] = new Cell(tiles.length, i);
  // }
  let a = 0;
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      grid[a] = new Cell(tiles.length, a, j, i);
      a++;
    }
  }

  // TEST cell computed getter modulo math
  // let ref_index = [3 + (DIM * 2)];
  // // 0, 1, 2, 3
  // // 4, 5, 6, 7*
  // // 8, 9, 10, 11
  // let ref_cell = grid[ref_index]
  // console.warn(
  //   'expect ref_cell.row = 2, ref_cell.col = 3',
  //   ref_cell.row,
  //   ref_cell.col
  // );
  // // expect ref_cell.UP.row = 1
  // // expect ref_cell.UP.col = 3
  // console.warn('UP r,c',ref_cell.UP.row, ref_cell.UP.col);
  // debugger;
  // expect ref_cell.RIGHT = null

  if(!isLooping()){
    loop();
  }
}

function checkValid(arr, valid) {
  if(!arr.length){
    return [];
  }
  let _arr = arr.slice();
  //console.log(arr, valid);
  for (let i = _arr.length - 1; i >= 0; i--) {
    // VALID: [BLANK, RIGHT]
    // ARR: [BLANK, UP, RIGHT, DOWN, LEFT]
    // result in removing UP, DOWN, LEFT
    let element = _arr[i];
    // console.log(element, valid.includes(element));
    if (!valid.includes(element)) {
      _arr.splice(i, 1);
    }
  }
  // if(!arr.length || arr[0] === undefined){
  //   console.log(arr);
  //   console.log("----------");
  //   debugger;
  // }
  return _arr;
}

// function mousePressed() {
//   if(mouseButton!==LEFT){
//     return;
//   }
//   if(isLooping()){
//       noLoop();
//   }else{
//     if(needs_restart){
//       startOver();
//     }
//     loop();
//   }
// }

function cellAt(row,col){
  return grid[(row*DIM)+col]
}

function checkAtLeastOneNeighborCollapsed(row,col){
  let at_least_one_collapsed = false;
  let cell = cellAt(row,col)
  for(neighbor of [
    cell.UP, //row > 0 ? grid[col + (row - 1) * DIM] : null, // up
    cell.RIGHT, //col < DIM - 1 ? grid[col + 1 + row * DIM] : null, // right
    cell.DOWN, //row < DIM - 1 ? grid[col + (row + 1) * DIM] : null, // down
    cell.LEFT, //col > 0 ? grid[col - 1 + row * DIM] : null // left
  ]){
      if(!neighbor || neighbor?.collapsed){
        at_least_one_collapsed = true;
      }
  }
  return at_least_one_collapsed;
}

function getCellsInWindowAroundCell(cell, window_size){
  // todo check window size is ODD , not even number
  let cells_in_window = []
  let half_win = Math.round( (window_size - 1) / 2 );

  let col_start = cell.col - half_win
  let col_end = cell.col + half_win;

  let row_start = cell.row - half_win
  // if(row_start < 0) row_start = 0;
  let row_end = cell.row + half_win;
  // if(row_end > DIM - 1) row_end = DIM - 1;

  for(let row = row_start; row <= row_end; row++){
    for(let col = col_start; col <= col_end; col++){
      let _rel_row = (row + DIM - 1) % DIM
      let _rel_col = (col + DIM - 1) % DIM
      //console.log({row,col,_rel_row,_rel_col})
      let index = (_rel_row * DIM) + _rel_col;
      cells_in_window.push(index);
      // noFill()
      // stroke(255, 0, 0);
      // rect(_rel_row * w, _rel_col * h, w, h);
      grid[index].recollapsing = true;
    }
  }

  // debugger;

  // console.log({cell,col_start,col_end,row_start,row_end,window_size,half_win,cells_in_window})
  // noLoop()
  // debugger;

  return cells_in_window
}

function checkAllCellsInWindowAreUnCollapsed(cells_in_window){
  let all_uncollapsed = true
  let a = 0;
  while(all_uncollapsed && a<cells_in_window.length){
    if(grid[cells_in_window[a]].collapsed){
      all_uncollapsed = false;
      break;
    }
    a++;
  }
  // console.log({all_uncollapsed});
  return all_uncollapsed
}

function checkAllCellsInWindowAreCollapsed(cells_in_window){
  let all_collapsed = true
  let a = 0;
  while(all_collapsed && a<cells_in_window.length){
    if(!grid[cells_in_window[a]].collapsed){
      all_collapsed = false;
      break;
    }
    a++;
  }
  // console.log({all_collapsed});
  return all_collapsed
}

function uncollapseAllCellsInWindow(cells_in_window){
  for(let cell_index of cells_in_window){
    grid[cell_index].uncollapse()
    grid[cell_index].recollapsing = true;
    let splice_index = collapsed.indexOf(cell_index)
    collapsed.splice(splice_index,1)
  }
}

function collapseCellsInWindow(cells_in_window){
  for(let a = 0; a<cells_in_window.length; a++){
    // refresh subset each time
    let gridSubset = []
    for(let cell_index of cells_in_window){
      gridSubset.push(grid[cell_index])
    }
    let pick = pickLowestEntropyRandomCell(gridSubset)
    let valid_options = getValidOptionsForCell(pick.row,pick.col)
    if(valid_options.length){
      let picked_option = random(valid_options)
      // collapse the cell
      grid[pick.index].collapsed = true;
      grid[pick.index].recollapsing = false
      grid[pick.index].options = [picked_option]
      collapsed.push(pick.index)
    }else{
      // another un-solvable cell,
      // skip it for now and the while loop will expand the entropy scramble window size
    }
  }
}

function recursivelyRecollapseRegionAroundCell(cell){
  let window_size = 3;
  let window_fixed = false;
  let do_start_over = false;
  while(window_size < (DIM*2) && !window_fixed){
    if(window_size > (DIM*2)){
      do_start_over = true;
      break;
    }
    let cells_in_window = getCellsInWindowAroundCell(cell,window_size);
    uncollapseAllCellsInWindow(cells_in_window);
    collapseCellsInWindow(cells_in_window);
    if(checkAllCellsInWindowAreCollapsed(cells_in_window)){
      window_fixed = true;
      break;
    }
    debugger;
    window_size+=2
  }
  if(do_start_over){
    startOver();
  }
}

let backtrack_window_size = 3; // start with the 9 adjacent cells

function backTrackAttemptOne(cell){
    console.log('backTrackAttemptOne',cell);
    debugger;
    const BT_THRESHOLD = 3; //tiles.length / 3;
    let backtrack_i = 0;
    let backtrack = true

    // we will grow this window up to max DIM (which would basically be the same as starting over)
    // increase by 2 each time to keep it odd (centered around origin cell)

    // TODO: un-collapse cells immediately surrounding "stuck"/un-collapsible cell
    // TODO: radiate un-collapsed "window" until the window can fully collapse

    // un-collapse any cells with no adjacent collapsed cells (unless it is the ONLY collapsed cell)
    // let gridTempCopy = grid.slice();
    // let _collapsed = gridTempCopy.filter(v => v.collapsed);
    // for(let i = 0; i<_collapsed.length; i++){
    //   let ref = _collapsed[i]
    //   let og = grid[ref.index]
    //   let orphaned = !checkAtLeastOneNeighborCollapsed(ref.row,ref.col)
    //   if(orphaned){
    //     let splice_index = collapsed.indexOf(ref.index)
    //     collapsed.splice(splice_index,1)
    //     og.uncollapse()
    //   }
    // }

    // let cells_in_window = getCellsInWindowAroundCell(cell, backtrack_window_size);
    // let all_cells_uncollapsed = checkAllCellsInWindowAreUnCollapsed(cells_in_window);
    // if(all_cells_uncollapsed){
    //   return;
    // }
    // let all_cells_collapsed = checkAllCellsInWindowAreCollapsed(cells_in_window);
    // console.log({
    //   cells_in_window,
    //   all_cells_collapsed
    // })
    // return;
    // debugger;
    // if(all_cells_collapsed){
    //   // reset backtrack window size
    //   backtrack_window_size = 3
    // }else{
      // uncollapseAllCellsInWindow(cells_in_window)

      // TODO: collapseAllCellsInWindow(cells_in_window);
      // noLoop();
      // backtrack_window_size+=2; // inc by 2 to keep an odd number
      // return;
    // }


    while(backtrack && backtrack_i < collapsed.length){
      backtrack_i++;
      if(collapsed.length < 5){
        // needs_restart = true;
        // backtrack = false;
        startOver();
        break;
        // continue;
      }
      let prev_c_index = collapsed.length - backtrack_i;
      if(prev_c_index >= collapsed.length){
        // prev_c_index = collapsed.length - 1;
        debugger;
        break;
      }
      if(prev_c_index < 0){
        debugger;
        break;
        // prev_c_index = 0;
      }

      let prev_index = collapsed?.[prev_c_index];
      let prev_cell = grid?.[prev_index];
      if(!prev_cell){
        console.error('not found',{prev_index,backtrack_i,c_len:collapsed.length})
        backtrack = false;
        break;
      }

      // did we already backtrack this tile?
      const prev_count_for_cell = backtrack_counter?.[prev_cell.index]

      if(prev_cell){
        // console.log('backtracking ', {
        //   backtrack_i,
        //   index:prev_cell.index,
        //   num_retries:backtrack_counter?.[prev_cell.index],
        //   num_collapsed:collapsed.length
        // })
        grid[prev_cell.index].uncollapse();

        backtrack_counter[prev_cell.index] =
          backtrack_counter?.[prev_cell.index]
          ? backtrack_counter[prev_cell.index]+1 : 1

        let in_c_arr = collapsed.indexOf(prev_cell.index)
        if(in_c_arr > -1){
          collapsed.splice(in_c_arr,1);
        }

        // recalculate entropy
        updateGrid();

        // if(backtrack_counter[prev_cell.index] < BT_THRESHOLD){
          // console.warn(pick_counter[prev_cell.index]);
          // debugger;
          // backtrack = false; // break loop if this cell hasn't been retried a bunch
        if(!prev_count_for_cell){
          break;
        }
          //OTHERWISE, let the loop continue BACKWARDS into the prev collapsed list to retry on older Cells
        // }
      }
    }

    grid[cell.index].uncollapse();
    backtrack_counter[cell.index] = backtrack_counter?.[cell.index] ? backtrack_counter[cell.index]+1 : 1;
    let in_c_arr = collapsed.indexOf(cell.index)
    if(in_c_arr > -1){
      collapsed.splice(in_c_arr,1);
    }
}

let num_updates = 0

function pickLowestEntropyRandomCell(cells){

  let gridCopy = cells.slice();
  gridCopy = gridCopy.filter((a) => !a.collapsed);
  // Sort By remaining options (lowest entropy first)
  gridCopy.sort((a, b) => {
    return a.options.length - b.options.length;
  });

  if(!gridCopy.length){
    return;
  }

  // cut array down to just the cells with identically lowest entropy
  let len = gridCopy[0].options.length;
  let stopIndex = 0;
  for (let i = 1; i < gridCopy.length; i++) {
    if (gridCopy[i].options.length > len) {
      stopIndex = i;
      break;
    }
  }

  if (stopIndex > 0) gridCopy.splice(stopIndex);

  // pick a random low entropy cell
  let cell = random(gridCopy);
  return cell;
}

function updateGrid(){
  num_updates++;

  let cell = pickLowestEntropyRandomCell(grid);
  // We're DONE!
  if(!cell){
    console.warn('DONE!');
    noLoop();
    needs_restart = true;
    return;
  }
  // pick a random option for the cell to collapse to
  // TODO: add weights/probabilities
  let pick = random(cell.options);
  // if(cell.index === 7 && pick === 3){
  //   debugger;
  // }
  // console.warn({pick,cell});
  if(pick === undefined){
    // console.warn('UNCOLLAPSIBLE',{cell});
    // noLoop();
    // needs_restart = true;
    // draw();
    // startOver();
    backTrackAttemptOne(cell);
    // recursivelyRecollapseRegionAroundCell(cell)
    // console.error('huh?!',cell);
    // cell.unsolvable = true;
    // noLoop();
    return;
  }
  // collapse the cell!
  cell.collapsed = true;
  // prev_cell_collapsed = cell.index;
  collapsed.push(cell.index);
  cell.options = [pick];
  cell.unsolvable = false;
  // console.log('picked',cell);
  // noFill()
  // stroke(0, 204, 255);
  // rect(cell.col * w, cell.row * h, w, h);
  // why is this diverging???
  // let actual = grid.filter(v => v.collapsed);
  // console.log(collapsed.length, actual.length);
  // if(collapsed.length != actual.length){
  //   let difference = collapsed
  //              .filter(x => !actual.includes(x));
  //   let diff2 = actual.filter(x => !collapsed.includes(x))
  //   debugger;
  // }

  // if(!collapsed.length){
  //   // pick one at random and move on
  //   let rand_start_cell = random(grid)
  //   let rand_start_opt = random(rand_start_cell.options);
  //   grid[rand_start_cell.index].collapsed = true;
  //   return;
  // }

  // recalculate cell entropy for cells adjacent to collapsed cells
  const nextGrid = [];
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let index = i + j * DIM;
      let calc_cell = grid[index]
      if (calc_cell.collapsed) {
        // already collapsed, keep it the same
        nextGrid[index] = calc_cell;
      } else {
        // if ZERO adjacent cells are collapsed, skip for now...
        const at_least_one_collapsed = checkAtLeastOneNeighborCollapsed(j,i)
        if(!at_least_one_collapsed){
          nextGrid[index] = grid[index]
          //nextGrid[index] = new Cell(tiles.length, index); //grid[index];
          // nextGrid[index] = new Cell(0, index, j, i);
          // console.log(collapsed.length, index, j, i);
        }else{
          // recalculate valid options for cell
          let final_options = getValidOptionsForCell(j,i)

          // console.warn(JSON.stringify({id:[j,i,index],final_options}))

          nextGrid[index] = new Cell(final_options, index, j, i);
          if(!final_options.length){
            nextGrid[index].unsolvable = true;
          }else{
            nextGrid[index].unsolvable = false;
          }

          // pre-collapse if only one option remains
          // if(final_options.length === 1){
          //   nextGrid[index].collapsed = true;
          //   collapsed.push(index);
          // }
        }
      }
    }
  }

  // console.warn(JSON.stringify(nextGrid[5]))

  grid = nextGrid;
}

function getValidOptionsForCell(j,i){
  if(!DEFAULT_EMPTY_OPTIONS_ARRAY.length){
    DEFAULT_EMPTY_OPTIONS_ARRAY = new Array(tiles.length).fill(0).map((x, i)=>i);
  }
  let final_options = DEFAULT_EMPTY_OPTIONS_ARRAY.slice();
  let cell = grid[(j*DIM)+i]

  // console.log({calc_cell});
  // if(num_updates>2){
  //   // debugger;
  // }
  // if(num_updates>1){
  //   // stroke(255, 204, 0);
  //   // rect(i * w, j * h, w, h);
  //   // return;
  // }

  //console.log('options before', )

  // references to adjacent cells
  let up,right,down,left;

  // Look up

  if (WRAP_AROUND || j > 0) {
    up = cell.UP;
    // if(!up){
    //   console.error(up)
    //   debugger;
    // }
    let neighborOptions = [];
    // if(!up?.options){
    //   debugger;
    // }
    for (let option of up.options) {
      // if(tiles[option] === undefined){
      //   debugger;
      // }
      let valid = tiles[option].down.slice();
      // pre-filter dupes
      // for(let presumed_valid of valid){
      //     if(!neighborOptions.includes(presumed_valid)){
      //         neighborOptions.push(presumed_valid);
      //     }
      // }
      neighborOptions = neighborOptions.concat(valid);
    }
    // console.log('compare', {in_opts:final_options.toString(),local:neighborOptions.toString()})
    // console.log('final options b4 valid up',cell.index,final_options.length);
    final_options = checkValid(final_options, neighborOptions);
    // if(!final_options.length){
    //   debugger;
    // }
  }

  // Look right
  if (WRAP_AROUND || i < DIM - 1) {
    right = cell.RIGHT;
    neighborOptions = [];
    for (let option of right.options) {
      // if(tiles[option] === undefined){
      //   debugger;
      // }
      let valid = tiles[option].left.slice();
      // for(let presumed_valid of valid){
      //     if(!neighborOptions.includes(presumed_valid)){
      //         neighborOptions.push(presumed_valid);
      //     }
      // }
      neighborOptions = neighborOptions.concat(valid);
    }
    // console.log('compare', {in_opts:final_options.toString(),local:neighborOptions.toString()})
    // console.log('final options b4 valid right',cell.index,final_options.length);
    final_options = checkValid(final_options, neighborOptions);
    // if(!final_options.length){
    //   debugger;
    // }
  }
  // Look down
  if (WRAP_AROUND || j < DIM - 1) {
    down = cell.DOWN;
    neighborOptions = [];
    for (let option of down.options) {
      // if(tiles[option] === undefined){
      //   debugger;
      // }
      let valid = tiles[option].up.slice();
      // for(let presumed_valid of valid){
      //     if(!neighborOptions.includes(presumed_valid)){
      //         neighborOptions.push(presumed_valid);
      //     }
      // }
      neighborOptions = neighborOptions.concat(valid);
    }
    // console.log('compare', {in_opts:final_options.toString(),local:neighborOptions.toString()})
    // console.log('final options  b4 valid down',cell.index,final_options.length);
    final_options = checkValid(final_options, neighborOptions);
    // if(!final_options.length){
    //   debugger;
    // }
  }
  // Look left
  if (WRAP_AROUND || i > 0) {
    left = cell.LEFT;
    neighborOptions = [];
    for (let option of left.options) {
      // if(tiles[option] === undefined){
      //   debugger;
      // }
      let valid = tiles[option].right.slice();
      // for(let presumed_valid of valid){
      //     if(!neighborOptions.includes(presumed_valid)){
      //         neighborOptions.push(presumed_valid);
      //     }
      // }
      neighborOptions = neighborOptions.concat(valid);
    }
    // console.log('compare', {in_opts:final_options.toString(),local:neighborOptions.toString()})
    // console.log('final options b4 valid left',cell.index,final_options.length);
    final_options = checkValid(final_options, neighborOptions);
    // if(!final_options.length){
    //   debugger;
    // }
  }
  // if(!final_options.length){
  //   console.error({up,right,down,left,cell})
  //   debugger;
  // }
  return final_options
}

function draw() {
  if(GLOBAL_DELAY && !needs_restart){
    noLoop();
    setTimeout(()=>{
      loop();
    },GLOBAL_DELAY*1000)
  }
  if(needs_restart){
    noLoop()
    return;
  }
  // update the grid
  updateGrid();

  // draw the grid
  // debugger;
  background(0);
  let textColor = color(255,0,0)
  textColor.setAlpha(parseInt(255*.5))
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      noFill();
      // tint(255, 255)
      let cell = grid[i + j * DIM];
      if(cell.unsolvable || cell.recollapsing){

        stroke(255,0,0);
        rect(i * w, j * h, w, h);
      }
      else if (cell.collapsed) {
        let index = cell.options[0];
        image(tiles[index].img, i * w, j * h, w, h);
      } else {
        //noFill();
        // if(cell.no_pick){
        //   stroke(255, 204, 0);
        // }else{
          stroke(160);
          fill(153)
        // }
        rect(i * w, j * h, w, h);
        // for(let option of cell.options){
        //   tint(255, parseInt(255*.1)); // Display at % opacity
        //   image(tiles[option].img, i * w, j * h, w, h);
        // }
        fill(textColor)
        textSize(9);
        text(cell.options.length.toString(), (i * w)-(w/2) + w, (j * h)-(h/2) + h);
      }
      // tint(255, parseInt(255*.1))
    }
  }
}
