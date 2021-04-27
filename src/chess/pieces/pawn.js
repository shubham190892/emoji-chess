const Piece = require('./piece').Piece;
const core = require('../core');
const Color = core.Color;
const Direction = {
  [Color.WHITE]: {
    left: {rj: -1, cj: -1},
    forward: {rj: -1, cj: 0},
    fastForward: {rj: -2, cj: 0},
    right: {rj: -1, cj: 1}
  },
  [Color.BLACK]: {
    left: {rj: 1, cj: 1},
    forward: {rj: 1, cj: 0},
    fastForward: {rj: 2, cj: 0},
    right: {rj: 1, cj: -1}
  }
};

function checkEnPassant(game, idx) {
  const lastMove = game.getLastMove();
  if (lastMove == null) return false;
  if (lastMove.piece !== 'P') return false;
  const source = core.Index.fromChess(lastMove.source);
  const target = core.Index.fromChess(lastMove.target);
  if (source.c !== idx.c || target.c !== idx.c) return false;
  const steps = Math.abs(source.r - target.r);
  if (steps !== 2) return false;
  return true;
}

class Pawn extends Piece {
  constructor(color) {
    super(color, 'Pawn', 'P');
  }
  attack(game, source) {
    const squares = new Set();
    const pawn = game.getPiece(source);
    const direction = Direction[pawn.color];
    const left = core.jump(game, source, direction.left);
    const right = core.jump(game, source, direction.right);
    if (left != null) squares.add(left.fr);
    if (right != null) squares.add(right.fr);
    return squares;
  }

  getLegalMoves(game, source) {
    const squares = new Set();
    const pawn = game.getPiece(source);
    const direction = Direction[pawn.color];

    let {r, c} = source;
    r += direction.forward.rj;
    c += direction.forward.cj;
    if (game.board[r][c] == null) {
      squares.add(core.Index.fromTable(r, c).fr);
      if (
        (pawn.color === Color.WHITE && source.r === 6) ||
        (pawn.color === Color.BLACK && source.r === 1)
      ) {
        r += direction.forward.rj;
        c += direction.forward.cj;
        if (game.board[r][c] == null) {
          squares.add(core.Index.fromTable(r, c).fr);
        }
      }
    }
    const attackingSquares = this.attack(game, source);
    for (const a of attackingSquares) {
      const idx = core.Index.fromChess(a);
      const tp = game.getPiece(idx);
      if (tp != null) {
        squares.add(a);
      } else {
        if (checkEnPassant(game, idx)) {
          squares.add(a);
        }
      }
    }
    return squares;
  }

  checkMoveLegal(game, source, target) {
    return this.getLegalMoves(game, source).has(target.fr);
  }

  move(game, source, target) {
    let tp = game.getPiece(target);
    game.migrate(source, target);
    if (tp == null && source.c !== target.c) {
      const rj = game.turn === 0 ? 1 : -1;
      tp = game.board[target.r + rj][target.c];
      game.board[target.r + rj][target.c] = null;
    }
    return tp;
  }
}

module.exports = {
  Pawn: Pawn
};
