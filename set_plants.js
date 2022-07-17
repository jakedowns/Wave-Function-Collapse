function LOAD_PLANTS_SET() {
  // plant set
  tiles.push(new Tile(0, ["AAA", "AAA", "AAA", "AAA"])); // 0,0,0,0
  tiles.push(new Tile(1, ["ABA", "AAA", "AAA", "AAA"])); // 1,0,0,0
  tiles.push(new Tile(1, ["ACA", "AAA", "AAA", "AAA"])); // 1,0,0,0
  tiles.push(new Tile(2, ["ABA", "AAA", "ABA", "AAA"])); // 1,0,1,0
  tiles.push(new Tile(3, ["AAA", "AAA", "ABA", "AAA"])); // 0,0,1,0
  tiles.push(new Tile(4, ["ABA", "AAA", "ABA", "AAA"])); // 1,0,1,0
  tiles.push(new Tile(5, ["ABA", "AAA", "ABA", "AAA"])); // 1,0,1,0
  tiles.push(new Tile(6, ["ABA", "AAA", "ABA", "AAA"])); // 1,0,1,0
  // tiles.push( new Tile(7,  ['ABA', 'AAA', 'AAA', 'ABA']) ); // 1,0,0,1
  // tiles.push( new Tile(8,  ['ABA', 'ABA', 'AAA', 'AAA']) ); // 1,1,0,0
  // tiles.push( new Tile(9,  ['ABA', 'AAA', 'ABA', 'ABA']) ); // 1,0,1,1
  // tiles.push( new Tile(10, ['ABA', 'ABA', 'ABA', 'AAA']) ); // 1,1,1,0
  // tiles.push( new Tile(11, ['ABA', 'ABA', 'ABA', 'ABA']) ); // 1,1,1,1
  tiles.push(new Tile(12, ["ABA", "AAA", "AAA", "ABA"])); // 1,0,0,1
  tiles.push(new Tile(13, ["ABA", "AAA", "ABA", "ABA"])); // 1,0,1,1
  tiles.push(new Tile(14, ["ABA", "ABA", "ABA", "AAA"])); // 1,1,1,0
  tiles.push(new Tile(15, ["ABA", "ABA", "AAA", "AAA"])); // 1,1,0,0

  tiles.push(new Tile(16, ["AAA", "AAA", "ACA", "AAA"])); //
  tiles.push(new Tile(17, ["ACA", "AAA", "ACA", "AAA"])); //
  tiles.push(new Tile(18, ["ACA", "AAA", "ACA", "ACA"])); //
  tiles.push(new Tile(19, ["ACA", "ACA", "ACA", "AAA"])); //
  tiles.push(new Tile(20, ["ACA", "ACA", "ACA", "ACA"])); //
  tiles.push(new Tile(21, ["ACA", "ACA", "AAA", "AAA"])); //
  tiles.push(new Tile(22, ["ACA", "AAA", "AAA", "ACA"])); //
  tiles.push(new Tile(23, ["ABA", "ABA", "ABA", "ABA"])); //

  // WATER
  tiles.push(new Tile(24, ["DDD", "DDD", "DDD", "DDD"])); //
  tiles.push(new Tile(25, ["ADD", "DDD", "DDA", "AAA"])); //
  tiles.push(new Tile(26, ["AAA", "ADD", "DDA", "AAA"])); //
  tiles.push(new Tile(30, ["AAA", "ADD", "DDD", "DDA"])); //
  tiles.push(new Tile(31, ["AAA", "AAA", "ADD", "DDA"])); //
  tiles.push(new Tile(32, ["DDA", "AAA", "ADD", "DDD"])); //
  tiles.push(new Tile(33, ["ADD", "DDD", "DDD", "DDA"])); //
  tiles.push(new Tile(34, ["DDA", "ADD", "DDD", "DDD"])); //
  tiles.push(new Tile(35, ["DDD", "DDA", "AAA", "ADD"])); //
  tiles.push(new Tile(36, ["DDA", "AAA", "AAA", "ADD"])); //
  tiles.push(new Tile(37, ["ADD", "DDA", "AAA", "AAA"])); //
  tiles.push(new Tile(38, ["DDD", "DDA", "ADD", "DDD"])); //
  tiles.push(new Tile(39, ["DDD", "DDD", "DDA", "ADD"])); //

  tiles.push(new Tile(27, ["AAA", "AAA", "AAA", "AAA"])); //
  tiles.push(new Tile(28, ["AAA", "AAA", "AAA", "AAA"])); //
  tiles.push(new Tile(29, ["AAA", "AAA", "AAA", "AAA"])); //
}
