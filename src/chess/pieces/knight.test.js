const Game = require('../game').Game;
const core = require('../core');

describe('knight attack', () => {
  it('should return knight attacking squares', () => {
    const g = new Game();
    g.init();
    const knight = g.getPiece(core.FR.b1);
    expect(knight.attack(g, core.FR.b1)).toEqual(new Set(['a3', 'c3']));
    g.migrate(core.FR.b1, core.FR.d6);
    expect(knight.attack(g, core.FR.d6)).toEqual(
      new Set(['c8', 'e8', 'c4', 'e4', 'b7', 'b5', 'f7', 'f5'])
    );
  });
});
