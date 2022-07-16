function reverseString(s) {
  let arr = s.split('');
  arr = arr.reverse();
  return arr.join('');
}

function compareEdge(a, b) {
  return a === reverseString(b);
}

class Tile {
  constructor(imgID, edges, i, newImg) {
    this.imgID = imgID;
    this.rotated_num = 0;
    this.img = newImg ?? tileImages[imgID];
    this.edges = edges;
    this.up = [];
    this.right = [];
    this.down = [];
    this.left = [];

    if (i !== undefined) {
      this.index = i;
    }
  }

  analyze(tiles) {
    const _loops_curves = [7,8,9,24]
    const _4_ways = [4,5,6,27,28,29,32,36,37,38,39]
    const _splits = [10,11,12,13,14,20,21,22,23,40,41,42,43]
    for (let i = 0; i < tiles.length; i++) {
      let tile = tiles[i];

      if (_loops_curves.includes(tile.imgID) && _loops_curves.includes(this.imgID)) continue;
      if (_4_ways.includes(tile.imgID) && _4_ways.includes(this.imgID)) continue;
      if (_splits.includes(tile.imgID) && _splits.includes(this.imgID)) continue;

      // allow tile 0 to connect to any tile
      // this.up.push(0)
      // this.right.push(0)
      // this.down.push(0)
      // this.left.push(0)

      // if(i === undefined){
      //   console.error('huh');
      //   debugger;
      // }

      // UP
      if (compareEdge(tile.edges[2], this.edges[0])) {
        this.up.push(i);
      }
      // RIGHT
      if (compareEdge(tile.edges[3], this.edges[1])) {
        this.right.push(i);
      }
      // DOWN
      if (compareEdge(tile.edges[0], this.edges[2])) {
        this.down.push(i);
      }
      // LEFT
      if (compareEdge(tile.edges[1], this.edges[3])) {
        this.left.push(i);
      }
    }
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
    return new Tile(this.imgID, newEdges, this.index, newImg);
  }
}
