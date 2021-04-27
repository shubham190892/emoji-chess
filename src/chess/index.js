const Game = require('./game').Game;
const command = require('./command');
const GS = require('./core').GameStatus;
const Color = require('./core').Color;

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getGameStatusMsg(game, status) {
  const tc = game.getTurnColor();
  switch (status) {
    case GS.CHECKMATE:
      return `${tc} Won by Checkmate`;
    case GS.STALEMATE:
      return 'Game Draw by Stalemate';
    case GS.DRAW_BY_AGREEMENT:
      return 'Game Draw by Agreement';
    case GS.DRAW_BY_3_FOLD_REPETITION:
      return 'Game Draw by 3 Fold Repetition';
    case GS.DRAW_BY_INSUFFICIENT_MATERIAL:
      return 'Game Draw due to Insufficient Material';
    case GS.DRAW_BY_50_MOVE_RULE:
      return 'Game Draw by 50 Move Rule';
    case GS.RESIGNATION:
      return `${tc} Lost by Resignation`;
    case GS.TIME_ZERO:
      return `${tc} Lost on Time`;
  }
}

function gameLoop(game) {
  const cmdText = `Move ${game.getMoveNumber()} -> ${
    game.turn === 0 ? "White's" : "Black's"
  } Turn: `;
  rl.question(cmdText, function (cmd) {
    cmd = command.parse(cmd);
    const res = cmd.execute(game);
    if (res.status) {
      game.displayBoard();
      if (res.data.gameStatus !== GS.LIVE) {
        console.log(getGameStatusMsg(game, res.data.gameStatus));
        rl.close();
        process.exit();
      }
      game.moveCounter++;
      game.switchTurn();
      gameLoop(game);
    } else {
      console.log('ERROR:', res.data.msg);
      gameLoop(game);
    }
  });
}

function start(game) {
  game.init();
  game.displayBoard();
  gameLoop(game);
}

const game = new Game(123, 9007);

start(game);
