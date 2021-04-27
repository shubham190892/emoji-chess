const core = require('../core');
const Piece = require('./piece').Piece;

class Queen extends Piece {
  constructor(color) {
    super(color, 'Queen', 'Q');
  }
  attack(game, source) {
    const squares = [].concat(
      core.walkStraight(game, source),
      core.walkDiagonal(game, source)
    );
    return new Set(squares);
  }
}

module.exports = {
  Queen: Queen
};
