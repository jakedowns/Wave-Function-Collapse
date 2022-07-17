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
    if(!WRAP_AROUND && this.row === 0){
      return null;
    }
    // debugger;
    let index = this.col + (((this.row + DIM - 1) % DIM) * DIM);
    // if(this.index === 7){
    //   console.warn('up',index);
    // }
    // let up = grid[i + ((j + DIM - 1) % DIM) * DIM];
    // if(index === undefined){
    //   debugger;
    // }
    return grid[index]
  }
  get RIGHT(){
    if(!WRAP_AROUND && this.col === DIM - 1){
      return null;
    }
    return grid[(((this.col + 1 + DIM) % DIM)) + (this.row * DIM)]
  }
  get DOWN(){
    if(!WRAP_AROUND && this.row === DIM - 1){
      return null;
    }
    return grid[this.col + (((this.row + DIM + 1) % DIM) * DIM)]
  }
  get LEFT(){
    if(!WRAP_AROUND && this.col === 0){
      return null;
    }
    let left_index = ((this.col - 1 + DIM) % DIM) + (this.row * DIM);
    // console.error({
    //   index:this.index,
    //   left_index,
    //   col:this.col,
    //   row:this.row
    // });
    // debugger;
    return grid[left_index]
  }
}
