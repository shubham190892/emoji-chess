const Piece = require('./piece').Piece;
const core = require('../core');

const directions = [
  {rj: 1, cj: 1},
  {rj: -1, cj: -1},
  {rj: 1, cj: -1},
  {rj: -1, cj: 1},
  {rj: 1, cj: 0},
  {rj: 0, cj: 1},
  {rj: -1, cj: 0},
  {rj: 0, cj: -1}
];

function checkRookLift(game, kingFR, rookFR) {
  //console.log('Check rook lift', kingFR, rookFR);
  const kingIdx = core.Index.fromChess(kingFR);
  const rookIdx = core.Index.fromChess(rookFR);
  let rook = game.getPiece(rookIdx);
  if (rook == null || game.getTurnColor() !== rook.color) return false;
  //console.log('Check flyway');
  const slide = rookIdx.c === 0 ? -1 : 1;
  let {r, c} = kingIdx;
  c += slide;
  while (c > 0 && c < game.size - 1) {
    const idx = core.Index.fromTable(r, c);
    if (game.getPiece(idx) != null) return false;
    c += slide;
  }
  //console.log('Check security');
  r = kingIdx.r;
  c = kingIdx.c;
  const attackedSquares = core.getAttackedSquares(game);
  for (let i = 0; i < 3; ++i) {
    if (attackedSquares.has(core.Index.fromTable(r, c).fr)) return false;
    c += slide;
  }
  //console.log('Check security');
  let top = game.history.length - 1;
  while (top >= 0) {
    const m = game.history[top];
    if (m.source === kingFR || m.source === rookFR) return false;
    top--;
  }

  return true;
}

function checkCastleRule(game, source, target) {
  let rook = null;
  if (source.fr === 'e1' && game.turn === 0) {
    rook = target.fr === 'g1' ? 'h1' : 'a1';
  } else if (source.fr === 'e8' && game.turn === 1) {
    rook = target.fr === 'g8' ? 'h8' : 'a8';
  }
  return rook !== null && checkRookLift(game, source.fr, rook);
}

class King extends Piece {
  constructor(color) {
    super(color, 'King', 'K');
  }
  attack(game, source) {
    const squares = new Set();
    for (const d of directions) {
      const target = core.jump(game, source, d);
      if (target != null) squares.add(target.fr);
    }
    return squares;
  }

  getLegalMoves(game, source) {
    let legalJump = this.attack(game, source);
    const attackedSquares = core.getAttackedSquares(game);
    legalJump = [...legalJump].filter(s => !attackedSquares.has(s));
    legalJump = new Set(legalJump);
    if (checkCastleRule(game, source, core.FR.g1)) legalJump.add('g1');
    if (checkCastleRule(game, source, core.FR.c1)) legalJump.add('c1');
    if (checkCastleRule(game, source, core.FR.g8)) legalJump.add('g8');
    if (checkCastleRule(game, source, core.FR.c8)) legalJump.add('c8');
    return legalJump;
  }
  checkMoveLegal(game, source, target) {
    return this.getLegalMoves(game, source).has(target.fr);
  }
}

module.exports = {
  King: King
};
