class Cell {
  constructor(value,index,row,col) {
    this.index = index;
    this.row = row;
    this.col = col;
    
    this.collapsed = false;
    if (value instanceof Array) {
      this.options = value.slice();
      if(this.options.length && this.options?.[0] === undefined){
        debugger;
      }
    } else {
      // this.options = [];
      // for (let i = 0; i < value; i++) {
      //   this.options[i] = i;
      // }
      this.options = new Array(value).fill(0).map((x, i) => i)
      if(this.options.length && this.options?.[0] === undefined){
        debugger;
      }
    }
  }
  uncollapse(){
    this.collapsed = false;
    this._resetOptions()
  }
  _resetOptions(){
    this.options = new Array(tiles.length).fill(0).map((x, i) => i)
    if(this.options.length && this.options?.[0] === undefined){
      debugger;
    }
  }
  get UP(){
    return grid[this.col + ((this.row + DIM - 1) % DIM) * DIM]
  }
  get RIGHT(){
    return grid[(this.col + 1) % DIM + this.row * DIM]
  }
  get DOWN(){
    return grid[this.col + ((this.row + 1) % DIM) * DIM]
  }
  get LEFT(){
    return grid[((this.col + DIM - 1) % DIM) + this.row * DIM]
  }
}
