const rewire = require('rewire');
const Game = require('./game').Game;
const core = require('./core');

const FR = core.FR;

const r_v = rewire('./validator');
const a5 = core.Index.fromChess('a5');
const a8 = core.Index.fromChess('a8');
const e7 = core.Index.fromChess('e7');
const e8 = core.Index.fromChess('e8');
const d8 = core.Index.fromChess('d8');
const f8 = core.Index.fromChess('f8');

describe('validateSource', () => {
  const validateSource = r_v.__get__('validateSource');
  const g = new Game();
  g.init();
  let out = {
    code: 'SOURCE_PIECE_NIL',
    status: false
  };
  it("White's turn", () => {
    expect(validateSource(g, ['c4'])).toEqual(out);
    out.code = 'OPPONENT_PIECE_AT_SOURCE';
    expect(validateSource(g, ['e7'])).toEqual(out);
    out.status = true;
    out.code = '';
    expect(validateSource(g, ['e2'])).toEqual(out);
  });
  it("Black's turn", function () {
    g.turn = 1;
    out.status = false;
    out.code = 'OPPONENT_PIECE_AT_SOURCE';
    expect(validateSource(g, ['e2'])).toEqual(out);
  });
});

describe('validateTarget', () => {
  const validateTarget = r_v.__get__('validateTarget');
  const g = new Game();
  g.init();
  let out = {
    code: 'SELF_PIECE_AT_TARGET',
    status: false
  };
  it("White's turn", () => {
    expect(validateTarget(g, ['', 'e1'])).toEqual(out);
    out.code = '';
    out.status = true;
    expect(validateTarget(g, ['', 'e7'])).toEqual(out);
    expect(validateTarget(g, ['', 'e4'])).toEqual(out);
    out.status = false;
    out.code = 'KING_AT_TARGET';
    expect(validateTarget(g, ['', 'e8'])).toEqual(out);
  });
  it("Black's turn", function () {
    g.turn = 1;
    out.status = false;
    out.code = 'SELF_PIECE_AT_TARGET';
    expect(validateTarget(g, ['', 'e7'])).toEqual(out);
  });
});

describe('validatePin', () => {
  const validatePin = r_v.__get__('validatePin');
  it('Pin: False', () => {
    const g = new Game();
    g.init();
    let ans = {status: false, code: 'PINNED_PIECE'};
    g.clone(d8, a5);
    // g.displayBoard();
    g.setPiece(g.getPiece(FR.h8), FR.d4);
    const tp = g.getPiece(FR.d4);
    let out = validatePin(g, ['d2', 'd4']);
    expect(out).toEqual(ans);
    expect(g.getPiece(FR.d4).name).toBe(tp.name);
    g.init();
    g.clone(f8, a5);
    out = validatePin(g, ['d2', 'd4']);
    expect(out).toEqual(ans);
  });

  it('Pin False, when attacker got captured', function () {
    let ans = {status: true, code: ''};
    const g = new Game();
    g.init();
    g.migrate(FR.d8, e7);
    g.migrate(FR.d1, FR.e2);
    //g.displayBoard();
    out = validatePin(g, ['e2', 'e7']);
    expect(out).toEqual(ans);
  });

  it('Pin: True', function () {
    const g = new Game();
    g.init();
    let ans = {status: true, code: ''};

    let out = validatePin(g, ['e2', 'e4']);
    expect(out).toEqual(ans);
    g.turn = 1;
    out = validatePin(g, ['e7', 'e5']);
    expect(out).toEqual(ans);

    g.init();
    let idx_t = core.Index.fromChess('e7');
    let idx_s = core.Index.fromChess('d8');
    g.setPiece(g.getPiece(idx_s), idx_t);
    out = validatePin(g, ['e2', 'e4']);
    expect(out).toEqual(ans);

    g.init();
    g.clone(a8, e8);
    out = validatePin(g, ['e2', 'd3']);
    expect(out).toEqual(ans);
  });
});

describe('validateCheckDefence', () => {
  const validateCheckDefence = r_v.__get__('validateCheckDefence');
  it('Check: False', () => {
    const ans = {status: false, code: 'KING_IN_CHECK'};
    const g = new Game();
    g.init();
    g.migrate(core.FR.e2, core.FR.h3);
    g.migrate(core.FR.e7, core.FR.h7);
    g.migrate(core.FR.d8, core.FR.e8);
    g.setPiece(g.getPiece(FR.h8), FR.h4);
    const tp = g.getPiece(FR.h4);
    let out = validateCheckDefence(g, ['h3', 'h4']);
    expect(out).toEqual(ans);
    expect(g.getPiece(FR.h4).name).toBe(tp.name);
  });
  it('Check: True', () => {
    const ans = {status: true, code: ''};
    const g = new Game();
    g.init();
    let out = validateCheckDefence(g, ['e2', 'e3']);
    expect(out).toEqual(ans);

    g.init();
    g.migrate(core.FR.e2, core.FR.h4);
    g.migrate(core.FR.e7, core.FR.h6);
    g.migrate(core.FR.d8, core.FR.e8);
    out = validateCheckDefence(g, ['h4', 'e2']);
    expect(out).toEqual(ans);
  });
});

describe('validatePieceRule', () => {
  const validatePieceRule = r_v.__get__('validatePieceRule');
  it('validatePieceRule: True', () => {
    const g = new Game();
    g.init();
    expect(validatePieceRule(g, ['e2', 'e3'])).toBeTruthy();
    expect(validatePieceRule(g, ['b1', 'c3'])).toBeTruthy();
  });
  it('validatePieceRule: False', () => {
    const ans = {code: 'ILLEGAL_PIECE_MOVE', status: false};
    const g = new Game();
    g.init();
    expect(validatePieceRule(g, ['e2', 'd3'])).toEqual(ans);
    // g.displayBoard();
    expect(validatePieceRule(g, ['d1', 'd3'])).toEqual(ans);
  });
});
