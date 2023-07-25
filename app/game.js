var Player = require('./player.js');
var Settings = require('./settings.js');
var GameStatus = require('./gameStatus.js');

/**
 * BattleshipGame constructor
 * @param {type} id Game ID
 * @param {type} idPlayer1 Socket ID of player 1
 * @param {type} idPlayer2 Socket ID of player 2
 */
function BattleshipGame(id, idPlayer1, idPlayer2, singlePlayer) {
  this.id = id;
  this.currentPlayer = singlePlayer ? 0 : Math.floor(Math.random() * 2);
  this.winningPlayer = null;

  this.gameStatus = singlePlayer ? GameStatus.onePlaced : GameStatus.preGame;
  this.singlePlayer = singlePlayer;

  this.players = [new Player(idPlayer1, false), new Player(idPlayer2, singlePlayer)];
}

/**
 * Get socket ID of player
 * @param {type} player
 * @returns {undefined}
 */
BattleshipGame.prototype.getPlayerId = function(player) {
  return this.players[player].id;
};

/**
 * Get socket ID of winning player
 * @returns {BattleshipGame.prototype@arr;players@pro;id}
 */
BattleshipGame.prototype.getWinnerId = function() {
  if(this.winningPlayer === null) {
    return null;
  }
  return this.players[this.winningPlayer].id;
};

/**
 * Get socket ID of losing player
 * @returns {BattleshipGame.prototype@arr;players@pro;id}
 */
BattleshipGame.prototype.getLoserId = function() {
  if(this.winningPlayer === null) {
    return null;
  }
  var loser = this.winningPlayer === 0 ? 1 : 0;
  return this.players[loser].id;
};

/**
 * Switch turns
 */
BattleshipGame.prototype.switchPlayer = function() {
  this.currentPlayer = this.currentPlayer === 0 ? 1 : 0;
};

/**
 * Abort game
 * @param {Number} player Player who made the request
 */
BattleshipGame.prototype.abortGame = function(player) {
  // give win to opponent
  this.gameStatus = GameStatus.gameOver;
  this.winningPlayer = player === 0 ? 1 : 0;
}

/**
 * Fire shot for current player
 * @param {Object} position with x and y
 * @returns {boolean} True if shot was valid
 */
BattleshipGame.prototype.shoot = function(position) {
  var opponent = this.currentPlayer === 0 ? 1 : 0,
      gridIndex = position.y * Settings.gridCols + position.x;

  if(this.players[opponent].shots[gridIndex] === 0 && this.gameStatus === GameStatus.inProgress) {
    // Square has not been shot at yet.
    if(!this.players[opponent].shoot(gridIndex)) {
      // Miss
      this.switchPlayer();
    }

    // Check if game over
    if(this.players[opponent].getShipsLeft() <= 0) {
      this.gameStatus = GameStatus.gameOver;
      this.winningPlayer = opponent === 0 ? 1 : 0;
    }

    if (this.singlePlayer && this.gameStatus === GameStatus.inProgress && this.currentPlayer === 1 ) {
      this.cpuTurn();
    }

    return true;
  }

  return false;
};

/**
 * Get game state update (for one grid).
 * @param {Number} player Player who is getting this update
 * @param {Number} gridOwner Player whose grid state to update
 * @returns {BattleshipGame.prototype.getGameState.battleshipGameAnonym$0}
 */
BattleshipGame.prototype.getGameState = function(player, gridOwner) {
  return {
    turn: this.currentPlayer === player,                 // is it this player's turn?
    gridIndex: player === gridOwner ? 0 : 1,             // which client grid to update (0 = own, 1 = opponent)
    grid: this.getGrid(gridOwner, player !== gridOwner)  // hide unsunk ships if this is not own grid
  };
};

/**
 * Get grid with ships for a player.
 * @param {type} player Which player's grid to get
 * @param {type} hideShips Hide unsunk ships
 * @returns {BattleshipGame.prototype.getGridState.battleshipGameAnonym$0}
 */
BattleshipGame.prototype.getGrid = function(player, hideShips) {
  return {
    shots: this.players[player].shots,
    ships: hideShips ? (this.gameStatus < GameStatus.inProgress ? [] : this.players[player].getSunkShips()) : this.players[player].ships
  };
};

BattleshipGame.prototype.cpuTurn = function () {
  var retry = 0;
  var position = { x: Math.floor(Math.random() * Settings.gridCols), y: Math.floor(Math.random() * Settings.gridRows) }; // Implement the AI's random shot function
  while (this.players[0].shots[position.x+(position.y*Settings.gridCols)] != 0 && retry++ < 10){
    position = { x: Math.floor(Math.random() * Settings.gridCols), y: Math.floor(Math.random() * Settings.gridRows) };
  }
  if (retry >= 10) {
    var index = this.players[0].shots.indexOf(0);
    position = { x: index % Settings.gridCols, y: Math.floor(index / Settings.gridRows) };
  }
  this.shoot(position);
  console.log('Generated shot at ', position.x, position.y);
  if (this.currentPlayer === 1 && this.gameStatus == GameStatus.inProgress) { // If the AI has another turn (it hit a ship)
    this.cpuTurn(); // Take another turn
  } else if (this.gameStatus == GameStatus.gameOver) {

  }
};


function generateRandomShot() {
  console.log('In generateRandomShot function');
  var x = Math.floor(Math.random() * Settings.gridCols);
  var y = Math.floor(Math.random() * Settings.gridRows);

  console.log('Generated shot at ', x, y);

  return { x: x, y: y };
}

module.exports = BattleshipGame;
