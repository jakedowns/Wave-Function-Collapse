let ROTATIONS_ENABLED = false;

let needs_restart = false;
// let prev_cell_collapsed = null;

// track the order in which cells collapsed
let collapsed = [];
// track how many times we've retried a cell to know if we should stop backtracking or keep backtracking further
let backtrack_counter = {}
// let pick_counter = {}
let did_last_draw = false;

let tile_sets = {
  squiggles: {
    max_id: 62,
    path: 'jake/',
  },
  plants: {
    max_id: 39,
    path: 'plants/',
  },
  circuit: {
    max_id: 12,
    path: 'circuit-coding-train/'
  },
  tracks: {
    max_id: 6,
    path: 'rail/tile'
  },
  monsters: {
    max_id: 4,
    path: 'monsters/'
  },
  pipes: {
    max_id: 1,
    path: 'pipes/'
  },
  pipes2: {
    max_id: 6,
    path: 'pipes2/'
  }
}

let selected_set = tile_sets?.[selected_set_key] ?? tile_sets.plants;

function removeDuplicatedTiles(tiles) {
  const uniqueTilesMap = {};
  for (const tile of tiles) {
    const key = tile.edges.join(','); // ex: "ABB,BCB,BBA,AAA"
    uniqueTilesMap[key] = tile;
  }
  return Object.values(uniqueTilesMap);
}

function preload(){
  for(let set_key of Object.keys(tile_sets)){
    let set = tile_sets[set_key];
    set.tileImages = [];
    for(let i = 0; i <= set.max_id; i++){
      set.tileImages[i] = loadImage(`tiles/${set.path}${i}.png`);
    }
  }
}

function loadTiles(){
  tiles = [];
  tileImages = selected_set.tileImages;

  console.log('loading tiles',selected_set_key);
  switch(selected_set_key){
    case 'plants':
      ROTATIONS_ENABLED = false
      LOAD_PLANTS_SET();
    break;
    case 'squiggles':
      ROTATIONS_ENABLED = true
      LOAD_SQUIGGLE_SET();
    break;
    case 'circuit':
      ROTATIONS_ENABLED = true
      LOAD_CIRCUIT_SET();
    break;
    case 'tracks':
      ROTATIONS_ENABLED = true
      LOAD_TRACKS_SET();
    break;
    case 'monsters':
      ROTATIONS_ENABLED = false
      LOAD_MONSTERS_SET();
    break;
    case 'pipes':
      ROTATIONS_ENABLED = true
      LOAD_PIPES_SET();
    break;
    case 'pipes2':
      ROTATIONS_ENABLED = true // TODO: per tile rotation settings
      LOAD_PIPES2_SET();
    break;
    default:
      console.error('failed to load tiles!',selected_set_key);
    break;
  }
  if(!tiles.length){
    throw new Error('failed to load tiles!');
  }
  // console.table(tiles);

  // assign indexes (for self-reference)
  for (let i = 0; i < tiles.length; i++) {
    tiles[i].index = i;
  }

  // generate variations
  if(ROTATIONS_ENABLED){
    const initialTileCount = tiles.length;
    for (let i = 0; i < initialTileCount; i++) {
      let tempTiles = [];
      for (let j = 0; j < 4; j++) {
        if(selected_set_key === 'pipes2'){
          if([1,4,5,6].includes(i)){
            continue;
          }
        }
        tempTiles.push(tiles[i].rotate(j));
      }
      // TODO: make this a per-set option or a user choice
      tempTiles = removeDuplicatedTiles(tempTiles);
      tiles.push(...tempTiles);
    }
    // console.log(tiles.length);
  }

  // Generate the adjacency rules based on edges
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    tile.analyze(tiles);
  }
}

// function loadTileImages(){
//   const path = `tiles/${selected_set.path}`;
//   for (let i = 0; i <= selected_set.max_id; i++) {
//     tileImages[i] = loadImage(`${path}${i}.png`);
//   }
// }

let seed = 1;
function setup() {
  // pixelDensity(4);
  createCanvas(640, 640);
  // drawingContext.imageSmoothingEnabled = false
  // noSmooth();

  randomSeed(seed);

  loadTiles();

  // console.table(tiles);
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
  // let cells_in_window = []
  // let half_win = Math.round( (window_size - 1) / 2 );

  // let col_start = cell.col - half_win
  // let col_end = cell.col + half_win;

  // let row_start = cell.row - half_win
  // // if(row_start < 0) row_start = 0;
  // let row_end = cell.row + half_win;
  // // if(row_end > DIM - 1) row_end = DIM - 1;

  // for(let row = row_start; row <= row_end; row++){
  //   for(let col = col_start; col <= col_end; col++){
  //     let _rel_row = (row + DIM - 1) % DIM
  //     let _rel_col = (col + DIM - 1) % DIM
  //     //console.log({row,col,_rel_row,_rel_col})
  //     let index = (_rel_row * DIM) + _rel_col;
  //     cells_in_window.push(index);
  //     // noFill()
  //     // stroke(255, 0, 0);
  //     // rect(_rel_row * w, _rel_col * h, w, h);
  //     grid[index].recollapsing = true;
  //   }
  // }

  // TODO: add a diagonal getter @ cell and
  // allow for dynamic window size
  // for now it's hand-coded since my modulo math was off...
  let cells_in_window = []
  cells_in_window.push(cell.UP?.LEFT?.index)
  cells_in_window.push(cell.UP?.index)
  cells_in_window.push(cell.UP?.RIGHT?.index)
  cells_in_window.push(cell.LEFT?.index)
  cells_in_window.push(cell.index)
  cells_in_window.push(cell.RIGHT?.index)
  cells_in_window.push(cell.DOWN?.LEFT?.index)
  cells_in_window.push(cell.DOWN?.index)
  cells_in_window.push(cell.DOWN?.RIGHT?.index)
  cells_in_window = cells_in_window.filter(c=>c)
  console.log({cells_in_window})

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
    let pick_id = pickLowestEntropyRandomCell(gridSubset)
    let pick = grid[pick_id]
    let valid_options = getValidOptionsForCell(pick.row,pick.col)
    if(valid_options.length){
      let picked_option = random(valid_options)
      // collapse the cell
      grid[pick.index].collapsed = true;
      grid[pick.index].recollapsing = false
      grid[pick.index].unsolvable = false
      grid[pick.index].options = [picked_option]
      collapsed.push(pick.index)
      console.log('recollapsed:',pick.index,picked_option)
    }else{
      // another un-solvable cell,
      // skip it for now and the while loop will expand the entropy scramble window size
      console.log('unsolvable',pick)
    }
  }
  // debugger;
}

function recursivelyRecollapseRegionAroundCell(cell){
  let window_size = 3;
  let window_fixed = false;
  let do_start_over = false;
  // while(collapsed.length && !window_fixed){
    // if(window_size > (DIM*2)){
    //   do_start_over = true;
    //   break;
    // }
    let cells_in_window = getCellsInWindowAroundCell(cell,window_size);
    console.log("cells_in_window",cells_in_window.length,cells_in_window);
    uncollapseAllCellsInWindow(cells_in_window);
    collapseCellsInWindow(cells_in_window);
    if(checkAllCellsInWindowAreCollapsed(cells_in_window)){
      window_fixed = true;
      // break;
    }
    console.log('window fixed?',window_fixed,cells_in_window);
    // debugger;
    // window_size+=1
  // }
  // if(do_start_over){
  //   startOver();
  // }
}

let backtrack_window_size = 3; // start with the 9 adjacent cells

function backTrackAttemptOne(cell){

    // console.log('backTrackAttemptOne',cell);
    // debugger;
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
        latest_uncollapsed_cell = prev_cell.index;
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
        // updateGrid();

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
  // if(IS_BACKTRACKING){
  //   console.log(JSON.stringify(gridCopy));
  // }
  // Sort By remaining options (lowest entropy first)
  gridCopy.sort((a, b) => {
    return a.options.length - b.options.length;
  });

  // if(typeof(gridCopy) === "undefined"){
  //   debugger;
  // }
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

  // console.log(gridCopy,collapsed.at(-1));
  // pick a random low entropy cell
  let cell_id = IS_BACKTRACKING ? gridCopy[0].index : random(gridCopy).index;
  // let cell_id = gridCopy[0].index;
  // let cell_id = random(gridCopy).index;
  if(!cell_id && cell_id !== 0){
    // debugger;
    console.error('bug')
  }
  return cell_id;
}

function updateGrid(){
  num_updates++;
  if(IS_BACKTRACKING){
    if(collapsed.includes(backtrack_started_at)){
      // console.log('BACKTRACK COMPLETE');
      // debugger;
      resetBacktracker();
    }
  }

  let cell_id = pickLowestEntropyRandomCell(grid);
  let cell = grid[cell_id]
  // We're DONE!
  if(!cell){
    console.warn('DONE!');
    if(IS_BACKTRACKING){
      // debugger;
      // console.error('bug')
    }
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
    console.warn('UNCOLLAPSIBLE',{cell});

    if(BACKTRACK_MODE === 'none'){
      noLoop();
      needs_restart = true;
      // draw();
      startOver();
      return;
    }

    if(!IS_BACKTRACKING){
      IS_BACKTRACKING = true;
      backtrack_started_at = cell.index;
      collapsed_at_backtrack_start = collapsed.slice();
    }
    console.log('backtracking... ',backtrack_started_at)

    if(BACKTRACK_MODE === 'sequential'){
      /* this one just walks backward... sometimes it works, sometimes it gets stuck */
      backTrackAttemptOne(cell);
    }else if(BACKTRACK_MODE === 'local'){
      recursivelyRecollapseRegionAroundCell(cell)
    }
    return;
  }



  // collapse the cell!
  cell.collapsed = true;
  // prev_cell_collapsed = cell.index;
  collapsed.push(cell.index);
  cell.options = [pick];
  cell.unsolvable = false;
  cell.recollapsing = false;
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

          // pre-collapse if only one option remains? (would need to recursively update neighbors)
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

function resetBacktracker(){
  IS_BACKTRACKING = false;
  backtrack_started_at = null;
  latest_uncollapsed_cell = null;
  collapsed_at_backtrack_start = null;
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
      neighborOptions.push(...valid);
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
      neighborOptions.push(...valid);
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
      neighborOptions.push(...valid);
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
      neighborOptions.push(...valid);
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
  // textColor.setAlpha(parseInt(255*.5))
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      // if(SHOW_ENTROPY){
        //   // return tint
        //   tint(255, 255)
        // }
      let cell = grid[i + j * DIM];
      if(cell.unsolvable || cell.recollapsing){
        noFill();
        stroke(255,0,0);
        rect(i * w, j * h, w, h);
      } else if (cell.collapsed) {
        let index = cell.options[0];
        image(tiles[index].img, i * w, j * h, w, h);
      } else {
        // //noFill();
        // // if(cell.no_pick){
        // //   stroke(255, 204, 0);
        // // }else{
        //   stroke(160);
        //   fill(153)
        // // }
        // rect(i * w, j * h, w, h);
        // if(SHOW_ENTROPY){
        //   for(let option of cell.options){
        //     tint(255, parseInt(255*.1)); // Display at % opacity
        //     image(tiles[option].img, i * w, j * h, w, h);
        //   }
        // }
        if(SHOW_NUMS){
          fill(textColor)
          textSize(9);
          text(cell.options.length.toString(),
            (i * w)-(w/2) + w,
            (j * h)-(h/2) + h,
            w,
            h
          );
        }
      }
      // tint(255, parseInt(255*.1))
    }
  }
}
