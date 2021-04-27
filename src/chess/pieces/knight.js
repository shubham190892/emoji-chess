const Piece = require('./piece').Piece;
const core = require('../core');
const directions = [
  {rj: 2, cj: -1},
  {rj: 2, cj: 1},
  {rj: -2, cj: -1},
  {rj: -2, cj: 1},
  {rj: -1, cj: 2},
  {rj: 1, cj: 2},
  {rj: -1, cj: -2},
  {rj: 1, cj: -2}
];

class Knight extends Piece {
  constructor(color) {
    super(color, 'Knight', 'N');
  }
  attack(game, source) {
    const squares = new Set();
    for (const d of directions) {
      const target = core.jump(game, source, d);
      if (target != null) squares.add(target.fr);
    }
    return squares;
  }
}

module.exports = {
  Knight: Knight
};
