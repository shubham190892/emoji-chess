const Game = require('../game').Game;
const core = require('../core');
const FR = core.FR;

describe('king attack', () => {
  it('should return squares attack by king', () => {
    const g = new Game();
    g.init();
    const king = g.getPiece(core.FR.e1);
    expect(king.attack(g, core.FR.e1)).toEqual(new Set());
    g.migrate(core.FR.e2, core.FR.a6);
    expect(king.attack(g, core.FR.a6)).toEqual(
      new Set(['a5', 'a7', 'b6', 'b7', 'b5'])
    );
  });
});

describe('King checkMoveLegal', () => {
  it('True', () => {
    const g = new Game();
    g.init();
    const king = g.getPiece(core.FR.e1);
    g.migrate(FR.e2, FR.e3);
    expect(king.checkMoveLegal(g, FR.e1, FR.e2)).toBeTruthy();

    g.migrate(FR.f1, FR.b5);
    g.migrate(FR.g1, FR.g4);
    expect(king.checkMoveLegal(g, FR.e1, FR.g1)).toBeTruthy();
  });
  it('False', () => {
    const g = new Game();
    g.init();
    const king = g.getPiece(core.FR.e1);
    expect(king.checkMoveLegal(g, FR.e1, FR.e2)).toBeFalsy();
  });

  it('Castle True', () => {
    const g = new Game();
    g.init();
    const king = g.getPiece(core.FR.e1);
    g.migrate(FR.e2, FR.e3);
    g.migrate(FR.f1, FR.b5);
    g.migrate(FR.g1, FR.g4);
    expect(king.checkMoveLegal(g, FR.e1, FR.g1)).toBeTruthy();

    g.migrate(FR.b1, FR.b2);
    g.migrate(FR.c1, FR.c2);
    g.migrate(FR.d1, FR.d2);
    expect(king.checkMoveLegal(g, FR.e1, FR.c1)).toBeTruthy();
  });

  it('Castle False', () => {
    const g = new Game();
    g.init();
    const king = g.getPiece(core.FR.e1);
    g.migrate(FR.e2, FR.e3);
    //g.migrate(FR.f1, FR.b5);
    g.migrate(FR.g1, FR.g4);
    expect(king.checkMoveLegal(g, FR.e1, FR.g1)).toBeFalsy();

    g.migrate(FR.f1, FR.b5);
    g.history.push(new core.Move(g, FR.h1, g.getPiece(FR.h1), FR.d5, null));
    expect(king.checkMoveLegal(g, FR.e1, FR.g1)).toBeFalsy();

    g.history.shift();
    g.migrate(FR.d8, FR.c4);
    //g.displayBoard();
    expect(king.checkMoveLegal(g, FR.e1, FR.g1)).toBeFalsy();
  });
});
