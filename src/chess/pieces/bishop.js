const core = require('../core');
const Piece = require('./piece').Piece;

class Bishop extends Piece {
  constructor(color) {
    super(color, 'Bishop', 'B');
  }

  attack(game, source) {
    return new Set(core.walkDiagonal(game, source));
  }
}

module.exports = {
  Bishop: Bishop
};
