const Game = require('../game').Game;
const core = require('../core');
const FR = core.FR;

describe('pawn attack', () => {
  it('should return pawn attacking squares', () => {
    const g = new Game();
    g.init();
    let p = g.getPiece(core.FR['e2']);
    let out = p.attack(g, core.FR['e2']);
    expect(out).toEqual(new Set(['d3', 'f3']));

    p = g.getPiece(core.FR['h2']);
    out = p.attack(g, core.FR['h2']);
    expect(out).toEqual(new Set(['g3']));

    g.migrate(core.FR['e2'], core.FR['e6']);
    p = g.getPiece(core.FR['e6']);
    out = p.attack(g, core.FR['e6']);
    expect(out).toEqual(new Set(['d7', 'f7']));
  });
});

describe('checkMoveLegal', () => {
  it('Legal: True', () => {
    const g = new Game();
    g.init();
    let p = g.getPiece(core.FR['e2']);
    let out = p.checkMoveLegal(g, core.FR['e2'], core.FR.e3);
    expect(out).toEqual(true);
    out = p.checkMoveLegal(g, core.FR['e2'], core.FR.e7);
    expect(out).toEqual(false);
    g.turn = 1;
    p = g.getPiece(core.FR['e7']);
    out = p.checkMoveLegal(g, core.FR['e7'], FR.e6);
    expect(out).toEqual(true);
    out = p.checkMoveLegal(g, core.FR['e7'], FR.e3);
    expect(out).toEqual(false);

    g.init();
    g.migrate(core.FR.a8, core.FR.d3);
    p = g.getPiece(core.FR['e2']);
    out = p.checkMoveLegal(g, core.FR['e2'], FR.d3);
    expect(out).toEqual(true);
  });

  it('en passant', () => {
    const g = new Game();
    g.init();
    g.migrate(core.FR.e2, core.FR.e5);
    g.turn = 1;
    g.history.push(new core.Move(g, FR.d7, g.getPiece(FR.d7), FR.d5, null));
    g.migrate(FR.d7, FR.d5);
    g.turn = 0;
    let p = g.getPiece(core.FR['e5']);
    let out = p.checkMoveLegal(g, core.FR['e5'], FR.d6);
    expect(out).toEqual(true);
  });
});

describe('Pawn move', () => {
  it('Capture: True', () => {
    const g = new Game();
    g.init();
    g.migrate(FR.d7, FR.d3);
    let p = g.getPiece(FR.e2);
    let out = p.move(g, FR.e2, FR.d3);
    expect(out.name).toBe('Pawn');

    g.init();
    g.migrate(FR.e2, FR.e5);
    g.migrate(FR.d7, FR.d5);
    out = p.move(g, FR.e5, FR.d6);
    expect(out.name).toBe('Pawn');
  });
  it('Capture: False', () => {
    const g = new Game();
    g.init();
    let p = g.getPiece(FR.e2);
    expect(p.move(g, FR.e2, FR.e3)).toEqual(null);
  });
});
