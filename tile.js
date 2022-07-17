function reverseString(s) {
  let arr = s.split('');
  arr = arr.reverse();
  return arr.join('');
}

function compareEdge(a, b) {
  return a === reverseString(b);
}

class Tile {
  constructor(imgID, edges, corners, newImg) {
    this.imgID = imgID;
    this.rotated_num = 0;
    this.img = newImg ?? tileImages[imgID];
    this.edges = edges;
    this.corners = corners;

    this.up = [];
    this.right = [];
    this.down = [];
    this.left = [];

    // corners
    this.UR = [];
    this.DR = [];
    this.DL = [];
    this.UL = [];
  }

  analyze(tiles) {
    const _loops_curves = [7,8,9,24]
    const _4_ways = [4,5,6,27,28,29,32,36,37,38,39]
    const _splits = [10,11,12,13,14,20,21,22,23,40,41,42,43]

    const _forks = [9,10,11]
    const _diag = [7,8]
    for (let i = 0; i < tiles.length; i++) {
      let tile = tiles[i];

      // if(this.imgID === tile.imgID) {
      //   continue;
      // }

      // if (_loops_curves.includes(tile.imgID) && _loops_curves.includes(this.imgID)) continue;
      // if (_4_ways.includes(tile.imgID) && _4_ways.includes(this.imgID)) continue;
      // if (_splits.includes(tile.imgID) && _splits.includes(this.imgID)) continue;
      // if (_diag.includes(tile.imgID) && _diag.includes(this.imgID)) continue;
      // if (_forks.includes(tile.imgID) && _forks.includes(this.imgID)) continue;

      // allow tile 0 to connect to any tile
      // this.up.push(0)
      // this.right.push(0)
      // this.down.push(0)
      // this.left.push(0)

      // if(i === undefined){
      //   console.error('huh');
      //   debugger;
      // }

      // let pot_v_blank = this.imgID === 1 && tile.imgID === 0;
      // let blank_v_pot = this.imgID === 0 && tile.imgID === 1;
      // let is_pot_and_blank = pot_v_blank || blank_v_pot;
      // let neither_is_pot = (this.imgID !== 1 && tile.imgID !== 1)
      // const true = true; //is_pot_and_blank || neither_is_pot

      const tile_is_fork = _forks.includes(tile.imgID)
      const this_is_fork = _forks.includes(this.imgID)
      const pass_fork_check =
        (!(tile_is_fork || this_is_fork))
        || (!(tile_is_fork && this_is_fork))

      const tile_is_diag = _diag.includes(tile.imgID)
      const this_is_diag = _diag.includes(this.imgID)
      const pass_diag_check =
        (!(tile_is_diag || this_is_diag))
        || (!(tile_is_diag && this_is_diag))

      let FLOWER = 3
      let BLANK = 0;
      const UP = 0;
      const RIGHT = 1;
      const DOWN = 2;
      const LEFT = 3;

      // UP
      if (compareEdge(tile.edges[DOWN], this.edges[UP])) {
        this.up.push(i);
      }

      // RIGHT
      if (compareEdge(tile.edges[LEFT], this.edges[RIGHT])) {
        if(pass_fork_check && pass_diag_check){
          this.right.push(i);
        }
      }

      // DOWN
      if (compareEdge(tile.edges[UP], this.edges[DOWN])) {
        this.down.push(i);
      }

      // LEFT
      if (compareEdge(tile.edges[RIGHT], this.edges[LEFT])) {
        if(pass_fork_check && pass_diag_check){
          this.left.push(i);
        }
      }

      // if(this.corners || tile.corners){

      // }
    }
    // if(this.imgID === 4){
    //   console.warn('did tile 4 have down options at analyze time?', this.down.slice());
    // }
  }

  rotate(num) {
    this.rotated_num = num;
    const w = this.img.width;
    const h = this.img.height;
    const newImg = createGraphics(w, h);
    newImg.imageMode(CENTER);
    newImg.translate(w / 2, h / 2);
    newImg.rotate(HALF_PI * num);
    newImg.image(this.img, 0, 0);

    const newEdges = [];
    const len = this.edges.length;
    for (let i = 0; i < len; i++) {
      newEdges[i] = this.edges[(i - num + len) % len];
    }
    let newCorners = null;
    if(this.corners){
      for(let i = 0; i < this.corners.len; i++){
        newCorners[i] = this.corners[(i - num + len) % len];
      }
    }
    return new Tile(this.imgID, newEdges, newCorners, newImg);
  }
}
