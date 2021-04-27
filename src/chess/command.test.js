const rewire = require('rewire');
const c = require('./command');
const rc = rewire('./command');

describe('validateCellCoordinate', () => {
  it('should return true if valid cell coordinates on chess board', () => {
    const vcc = rc.__get__('validateCellCoordinate');
    expect(vcc('b4')).toBeTruthy();
    expect(vcc('c2')).toBeTruthy();
    expect(vcc('g4')).toBeTruthy();
    expect(vcc('h8')).toBeTruthy();
    expect(vcc('a1')).toBeTruthy();
    expect(vcc('')).toBeFalsy();
    expect(vcc('xyz')).toBeFalsy();
    expect(vcc('22')).toBeFalsy();
    expect(vcc('a')).toBeFalsy();
    expect(vcc('2')).toBeFalsy();
    expect(vcc('a0')).toBeFalsy();
    expect(vcc('i3')).toBeFalsy();
  });
});

describe('parse', () => {
  it('should return correct command object', () => {
    let out = c.parse('c4 h1');
    expect(out.type).toBe(2);
    expect(out.tokens).toStrictEqual(['c4', 'h1']);

    out = c.parse('c4 c4');
    expect(out.type).toBe(0);

    out = c.parse('c4 h9');
    expect(out.type).toBe(0);

    out = c.parse('c4 c6 K');
    expect(out.type).toBe(0);

    out = c.parse('c4 c6 Q');
    expect(out.type).toBe(3);

    out = c.parse('resign');
    expect(out.type).toBe(1);
    expect(out.tokens).toStrictEqual(['resign']);

    out = c.parse('draw');
    expect(out.type).toBe(1);
    expect(out.tokens).toStrictEqual(['draw']);
  });
});
