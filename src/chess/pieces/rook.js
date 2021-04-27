const core = require('../core');
const Piece = require('./piece').Piece;

class Rook extends Piece {
  constructor(color) {
    super(color, 'Rook', 'R');
  }

  attack(game, source) {
    return new Set(core.walkStraight(game, source));
  }
}

module.exports = {
  Rook: Rook
};
