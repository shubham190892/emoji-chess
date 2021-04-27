const R = require('ramda');

const File = Object.freeze({a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7});
const Rank = Object.freeze({8: 0, 7: 1, 6: 2, 5: 3, 4: 4, 3: 5, 2: 6, 1: 7});
const Row = {};
for (const k of Object.keys(Rank)) Row[Rank[k]] = k;
const Col = {};
for (const k of Object.keys(File)) Col[File[k]] = k;

class Index {
  r;
  c;
  fr;
  constructor() {}
}

function fromTable(r, c) {
  const idx = new Index();
  idx.r = r;
  idx.c = c;
  idx.fr = Col[c] + Row[r];
  return idx;
}

function fromChess(fr) {
  const idx = new Index();
  idx.r = Rank[fr[1]];
  idx.c = File[fr[0]];
  idx.fr = fr;
  return idx;
}

const FileRank = {};
for (const f of Object.keys(File)) {
  for (const r of Object.keys(Rank)) {
    const fr = f + r;
    FileRank[fr] = fromChess(fr);
  }
}

class Move {
  move;
  turn;
  source;
  target;
  piece;
  capture;
  snapshot;

  constructor(game, source, sp, target, tp) {
    this.move = game.getMoveNumber();
    this.turn = game.getTurnColor();
    this.source = source.fr;
    this.target = target.fr;
    this.piece = sp.symbol;
    this.capture = tp == null ? null : tp.symbol;
    this.snapshot = game.getSnapshot();
  }

  toString() {
    return `${this.move} (${this.source}:${this.piece} -> ${this.target}:${this.capture})`;
  }
}

const GameStatus = Object.freeze({
  CHECKMATE: 0,
  STALEMATE: 1,
  DRAW_BY_AGREEMENT: 2,
  DRAW_BY_3_FOLD_REPETITION: 3,
  DRAW_BY_50_MOVE_RULE: 4,
  DRAW_BY_INSUFFICIENT_MATERIAL: 5,
  RESIGNATION: 6,
  TIME_ZERO: 7,
  LIVE: 100
});

const Color = Object.freeze({
  WHITE: 'White',
  BLACK: 'Black'
});

const Emoji = Object.freeze({
  White: {
    Square: '▦',
    Pawn: '♟',
    Rook: '♜',
    Knight: '♞',
    Bishop: '♝',
    Queen: '♛',
    King: '♚'
  },
  Black: {
    Square: '░',
    Pawn: '♙',
    Rook: '♖',
    Knight: '♘',
    Bishop: '♗',
    Queen: '♕',
    King: '♔'
  },
  Number: {
    1: '1',
    2: '️2',
    3: '️3',
    4: '️4',
    5: '5',
    6: '️6',
    7: '️7',
    8: '️8'
  },
  Letter: {
    A: ' A',
    B: 'B',
    C: 'C',
    D: 'D',
    E: 'E',
    F: 'F',
    G: 'G',
    H: 'H'
  },
  CornerStone: '⚙'
});

function scan(game, filter) {
  const whiteKeys = new Set(R.propOr([], 'white', filter));
  const blackKeys = new Set(R.propOr([], 'black', filter));
  const res = {
    white: {squares: {}},
    black: {squares: {}}
  };
  for (let r = 0; r < game.size; ++r) {
    for (let c = 0; c < game.size; ++c) {
      const p = game.board[r][c];
      if (p == null) continue;
      const colorKey = p.color === Color.WHITE ? 'white' : 'black';
      const colorSet = p.color === Color.WHITE ? whiteKeys : blackKeys;
      const idx = fromTable(r, c);
      if (p.symbol === 'K') {
        res[colorKey]['King'] = idx.fr;
      } else {
        if (colorSet.has(p.symbol)) res[colorKey]['squares'][idx.fr] = p.symbol;
      }
    }
  }
  return res;
}

function jump(game, source, direction) {
  let {r, c} = source;
  r += direction.rj;
  c += direction.cj;
  if (game.idxOnBoard(r, c)) {
    const idx = fromTable(r, c);
    const attacker = game.getPiece(source);
    if (attacker == null) return null;
    const targetPiece = game.getPiece(idx);
    if (targetPiece == null || attacker.color !== targetPiece.color) {
      return idx;
    }
  }
  return null;
}

function walk(game, source, rowJump, colJump) {
  const squares = [];
  const attacker = game.getPiece(source);
  if (attacker == null) return squares;
  let {r, c} = source;
  r += rowJump;
  c += colJump;

  while (game.idxOnBoard(r, c)) {
    const p = game.board[r][c];
    if (p != null) {
      if (attacker.color !== p.color) squares.push(fromTable(r, c).fr);
      break;
    }
    squares.push(fromTable(r, c).fr);
    r += rowJump;
    c += colJump;
  }
  return squares;
}

function walkStraight(game, source) {
  const up = walk(game, source, -1, 0);
  const down = walk(game, source, 1, 0);
  const left = walk(game, source, 0, -1);
  const right = walk(game, source, 0, 1);
  return [].concat(up, down, left, right);
}

function walkDiagonal(game, source) {
  const up_left = walk(game, source, -1, -1);
  const up_right = walk(game, source, 1, -1);
  const down_left = walk(game, source, -1, 1);
  const down_right = walk(game, source, 1, 1);
  return [].concat(up_left, up_right, down_left, down_right);
}

function getAttackedSquares(game) {
  const defender = game.turn === 0 ? 'white' : 'black';
  const attackedSquares = new Set();
  for (let r = 0; r < game.size; r++) {
    for (let c = 0; c < game.size; ++c) {
      const p = game.board[r][c];
      if (p == null || p.color.toLowerCase() === defender) {
        continue;
      }
      const squares = p.attack(game, fromTable(r, c));
      for (const s of squares) attackedSquares.add(s);
    }
  }
  return attackedSquares;
}

function checkAttackOnKing(game) {
  const defender = game.turn === 0 ? 'white' : 'black';
  const scanRes = scan(game, {[defender]: ['K']});
  const king = scanRes[defender]['King'];
  for (let r = 0; r < game.size; r++) {
    for (let c = 0; c < game.size; ++c) {
      const p = game.board[r][c];
      if (p == null || p.symbol === 'K' || p.color.toLowerCase() === defender) {
        continue;
      }
      const squares = p.attack(game, fromTable(r, c));
      if (squares.has(king)) {
        return true;
      }
    }
  }
  return false;
}

function checkStalemate(game) {
  for (let r = 0; r < game.size; ++r) {
    for (let c = 0; c < game.size; ++c) {
      const idx = fromTable(r, c);
      const p = game.getPiece(idx);
      if (p == null || game.getTurnColor() !== p.color) continue;
      if (p.getLegalMoves(game, idx).size > 0) return false;
    }
  }
  return true;
}

function checkBlockingAttackOnKing(game, source, defender) {
  for (let r = 0; r < game.size; r++) {
    for (let c = 0; c < game.size; ++c) {
      const p = game.board[r][c];
      if (p == null || p.symbol === 'K' || p.color.toLowerCase() !== defender) {
        continue;
      }
      const legalMoves = p.getLegalMoves(game, source);
      for (const lm of legalMoves) {
        const target = fromChess(lm);

        const tp = game.getPiece(target);
        game.migrate(source, target);
        if (!checkAttackOnKing(game)) return true;
        game.migrate(target, source);
        game.setPiece(tp, target);
      }
    }
  }
  return false;
}

function checkCheckmate(game) {
  if (checkAttackOnKing(game)) {
    const defender = game.turn === 0 ? 'white' : 'black';
    const scanRes = scan(game, {[defender]: ['K']});
    const kingFR = scanRes[defender]['King'];
    const kingIdx = fromChess(kingFR);
    const king = game.getPiece(kingIdx);
    if (king.getLegalMoves(game, kingIdx).size === 0) {
      if (!checkBlockingAttackOnKing(game, kingIdx, defender)) {
        return true;
      }
    }
  }
  return false;
}

function checkDrawByInsufficientMaterial(game) {
  let counter = {
    [Color.WHITE]: 0,
    [Color.BLACK]: 0
  };
  const pieces = new Set(['K', 'N', 'B']);
  for (let r = 0; r < game.size; r++) {
    for (let c = 0; c < game.size; ++c) {
      const p = game.board[r][c];
      if (p == null) continue;
      if (!pieces.has(p.symbol)) return false;
      counter[p.color]++;
    }
  }
  return counter[Color.WHITE] < 3 && counter[Color.BLACK] < 3;
}

function checkMovePawnOrCapture(move) {
  return move.piece === 'P' || move.capture != null;
}

function checkDrawBy3FoldRepetition(game) {
  let top = game.history.length - 1;
  let repeat = {};
  while (top >= 0) {
    const m = game.history[top--];
    if (checkMovePawnOrCapture(m)) return false;
    const k = m.snapshot;
    if (repeat[k]) {
      repeat[k]++;
      if (repeat[k] === 3) return true;
    } else {
      repeat[k] = 1;
    }
  }
  return false;
}

function checkDrawByFiftyMoveRule(game) {
  let top = game.history.length;
  if (top % 2 === 0 || top < 100) return false;
  let c = 0;
  while (top >= 0) {
    const bm = game.history[top--];
    const wm = game.history[top--];
    if (checkMovePawnOrCapture(bm) || checkMovePawnOrCapture(wm)) {
      return false;
    } else {
      c++;
    }
    if (c === 50) return true;
  }
  return false;
}

module.exports = {
  Color: Color,
  Emoji: Emoji,
  GameStatus: GameStatus,
  scan: scan,
  Index: {
    fromTable: fromTable,
    fromChess: fromChess
  },
  FR: FileRank,
  walkStraight: walkStraight,
  walkDiagonal: walkDiagonal,
  jump: jump,
  checkAttackOnKing: checkAttackOnKing,
  getAttackedSquares: getAttackedSquares,
  Move: Move,
  checkStalemate: checkStalemate,
  checkCheckmate: checkCheckmate,
  checkDrawByFiftyMoveRule: checkDrawByFiftyMoveRule,
  checkDrawBy3FoldRepetition: checkDrawBy3FoldRepetition,
  checkDrawByInsufficientMaterial: checkDrawByInsufficientMaterial
};
