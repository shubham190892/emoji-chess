const Color = require('../core').Color;
class Piece {
  color;
  name;
  symbol;
  notation;
  constructor(color, name, symbol) {
    this.color = color;
    this.name = name;
    this.symbol = symbol;
    this.notation = (color === Color.WHITE ? 'w' : 'b') + symbol;
  }

  attack(game, source) {
    return new Set();
  }

  getLegalMoves(game, source) {
    const p = game.getPiece(source);
    return p.attack(game, source);
  }

  checkMoveLegal(game, source, target) {
    const p = game.getPiece(source);
    return p.getLegalMoves(game, source).has(target.fr);
  }

  move(game, source, target) {
    const tp = game.getPiece(target);
    game.migrate(source, target);
    return tp;
  }

  toString() {
    return this.notation;
  }
}

module.exports = {
  Piece: Piece
};
