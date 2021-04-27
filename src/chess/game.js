const Pawn = require('./pieces/pawn').Pawn;
const Rook = require('./pieces/rook').Rook;
const Knight = require('./pieces/knight').Knight;
const Bishop = require('./pieces/bishop').Bishop;
const Queen = require('./pieces/queen').Queen;
const King = require('./pieces/king').King;

const core = require('./core');

const Color = core.Color;
const Emoji = core.Emoji;

class Game {
  size;
  board;
  moveCounter;
  turn;
  whitePlayerId;
  blackPlayerId;
  history;

  constructor(whitePlayerId, blackPlayerId) {
    this.whitePlayerId = whitePlayerId;
    this.blackPlayerId = blackPlayerId;
    this.moveCounter = 1;
    this.turn = 0;
    this.size = 8;
    this.history = [];
    this.board = new Array(this.size);
    for (let i = 0; i < this.size; ++i) {
      this.board[i] = [];
      for (let j = 0; j < this.size; j++) {
        this.board[i].push(null);
      }
    }
  }

  switchTurn() {
    this.turn = this.turn ^ 1;
  }

  getMoveNumber() {
    return Math.floor((this.moveCounter + 1) / 2);
  }

  getPiece(idx) {
    return this.board[idx.r][idx.c];
  }

  setPiece(p, idx) {
    this.board[idx.r][idx.c] = p;
  }

  migrate(source, target) {
    this.board[target.r][target.c] = this.board[source.r][source.c];
    this.board[source.r][source.c] = null;
  }

  clone(source, target) {
    this.board[target.r][target.c] = this.board[source.r][source.c];
  }

  idxOnBoard(r, c) {
    return r >= 0 && r < this.size && c >= 0 && c < this.size;
  }

  getLastMove() {
    if (this.history.length === 0) return null;
    return this.history[this.history.length - 1];
  }

  getTurnColor() {
    return this.turn === 0 ? Color.WHITE : Color.BLACK;
  }
  getSnapshot() {
    const keys = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; ++c) {
        const p = this.board[r][c];
        keys.push(p == null ? '#' : p.notation);
      }
    }
    return keys.join('');
  }

  init() {
    this.moveCounter = 1;
    this.turn = 0;
    for (let i = 0; i < this.size; ++i) {
      this.board[1][i] = new Pawn(Color.BLACK);
      this.board[6][i] = new Pawn(Color.WHITE);
    }
    this.board[0][0] = new Rook(Color.BLACK);
    this.board[0][7] = new Rook(Color.BLACK);
    this.board[0][1] = new Knight(Color.BLACK);
    this.board[0][6] = new Knight(Color.BLACK);
    this.board[0][2] = new Bishop(Color.BLACK);
    this.board[0][5] = new Bishop(Color.BLACK);
    this.board[0][3] = new Queen(Color.BLACK);
    this.board[0][4] = new King(Color.BLACK);

    this.board[7][0] = new Rook(Color.WHITE);
    this.board[7][7] = new Rook(Color.WHITE);
    this.board[7][1] = new Knight(Color.WHITE);
    this.board[7][6] = new Knight(Color.WHITE);
    this.board[7][2] = new Bishop(Color.WHITE);
    this.board[7][5] = new Bishop(Color.WHITE);
    this.board[7][3] = new Queen(Color.WHITE);
    this.board[7][4] = new King(Color.WHITE);
  }

  reset() {
    for (let r = 0; r < this.size; ++r) {
      for (let c = 0; c < this.size; ++c) {
        this.board[r][c] = null;
      }
    }
    this.init();
  }

  displayBoard() {
    const leftPadding = '                ';
    const rows = [];
    for (let i = 0; i < this.size; ++i) {
      const rank = [Emoji.Number[8 - i] + '|'];
      for (let j = 0; j < this.size; ++j) {
        const piece = this.board[i][j];
        let c;
        if (piece == null) {
          if ((i + j) % 2 === 0) {
            c = Emoji.White.Square;
          } else {
            c = Emoji.Black.Square;
          }
        } else {
          c = Emoji[piece.color][piece.name];
        }
        rank.push(c);
      }
      rows.push(leftPadding+rank.join(' '));


    }
    rows.push(leftPadding+'^ ----------------');
    rows.push(leftPadding+
      [
        '>',
        Emoji.Letter.A,
        Emoji.Letter.B,
        Emoji.Letter.C,
        Emoji.Letter.D,
        Emoji.Letter.E,
        Emoji.Letter.F,
        Emoji.Letter.G,
        Emoji.Letter.H
      ].join(' ')
    );
    console.log(rows.join('\n'));
  }
}

module.exports = {
  Game: Game
};
