const core = require('./core');

function validateSource(game, tokens) {
  //console.log('Call: validateSource');
  const res = {status: false, code: ''};
  const p = game.getPiece(core.Index.fromChess(tokens[0]));
  if (p == null) {
    res.code = 'SOURCE_PIECE_NIL';
  } else if (game.getTurnColor() !== p.color) {
    res.code = 'OPPONENT_PIECE_AT_SOURCE';
  } else {
    res.status = true;
  }
  return res;
}

function validateTarget(game, tokens) {
  //console.log('Call: validateTarget');
  const res = {status: true, code: ''};
  const p = game.getPiece(core.Index.fromChess(tokens[1]));
  if (p == null) return res;

  if (game.getTurnColor() === p.color) {
    res.status = false;
    res.code = 'SELF_PIECE_AT_TARGET';
  } else if (p.symbol === 'K') {
    res.status = false;
    res.code = 'KING_AT_TARGET';
  }

  return res;
}

function validatePin(game, tokens) {
  //console.log('Call: validatePin');
  const source = core.Index.fromChess(tokens[0]);
  const target = core.Index.fromChess(tokens[1]);
  const tp = game.getPiece(target);
  game.migrate(source, target);

  const res = {status: true, code: ''};
  const active = game.turn === 0 ? 'white' : 'black';
  const passive = game.turn === 0 ? 'black' : 'white';
  const scanRes = core.scan(game, {
    [active]: ['K'],
    [passive]: ['Q', 'R', 'B']
  });
  const attackSources = Object.keys(scanRes[passive]['squares']);
  for (const a of attackSources) {
    const idx = core.Index.fromChess(a);
    const attacker = game.getPiece(idx);
    const targetSquares = attacker.attack(game, idx);
    if (targetSquares.has(scanRes[active]['King'])) {
      res.status = false;
      res.code = 'PINNED_PIECE';
      break;
    }
  }
  game.migrate(target, source);
  game.setPiece(tp, target);
  return res;
}

function validateCheckDefence(game, tokens) {
  //console.log('Call: validateCheckDefence');
  const res = {status: true, code: ''};
  if (core.checkAttackOnKing(game)) {
    const source = core.Index.fromChess(tokens[0]);
    const target = core.Index.fromChess(tokens[1]);
    const tp = game.getPiece(target);
    game.migrate(source, target);
    if (core.checkAttackOnKing(game)) {
      res.status = false;
      res.code = 'KING_IN_CHECK';
    }
    game.migrate(target, source);
    game.setPiece(tp, target);
  }
  return res;
}

function validatePieceRule(game, tokens) {
  //console.log('Call: validatePieceRule');
  const res = {status: true, code: ''};
  const source = core.Index.fromChess(tokens[0]);
  const target = core.Index.fromChess(tokens[1]);
  const piece = game.getPiece(source);
  if (!piece.checkMoveLegal(game, source, target)) {
    res.status = false;
    res.code = 'ILLEGAL_PIECE_MOVE';
  }
  return res;
}

module.exports = {
  validators: [
    validateSource,
    validateTarget,
    validateCheckDefence,
    validatePin,
    validatePieceRule
  ]
};
