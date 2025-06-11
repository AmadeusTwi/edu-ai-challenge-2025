import { Board } from "../models/Board.js";
import { HumanPlayer, CPUPlayer } from "../players/Player.js";
import { GameIO } from "../io/GameIO.js";

export class SeaBattleGame {
  constructor(config = {}) {
    this.boardSize = config.boardSize || 10;
    this.numShips = config.numShips || 3;
    this.shipLength = config.shipLength || 3;

    this.gameIO = new GameIO();
    this.playerBoard = new Board(this.boardSize);
    this.cpuBoard = new Board(this.boardSize);

    this.humanPlayer = new HumanPlayer(this.playerBoard, this.gameIO);
    this.cpuPlayer = new CPUPlayer(this.cpuBoard);

    this.currentTurn = "human";
    this.gameOver = false;
    this.winner = null;
  }

  async initialize() {
    try {
      this.gameIO.displayMessage("Setting up the game...");
      this.humanPlayer.placeShips(this.numShips, this.shipLength);
      this.cpuPlayer.placeShips(this.numShips, this.shipLength);
      this.gameIO.displayMessage(
        `${this.numShips} ships placed for both players.`
      );
      this.gameIO.displayWelcome(this.numShips);
      return true;
    } catch (error) {
      this.gameIO.displayMessage(`Error initializing game: ${error.message}`);
      return false;
    }
  }

  async play() {
    const initialized = await this.initialize();
    if (!initialized) {
      this.gameIO.close();
      return;
    }

    while (!this.gameOver) {
      this.gameIO.displayBoards(this.cpuBoard, this.playerBoard);

      if (this.currentTurn === "human") {
        await this.executeHumanTurn();
      } else {
        await this.executeCPUTurn();
      }

      this.checkGameOver();

      if (!this.gameOver) {
        this.currentTurn = this.currentTurn === "human" ? "cpu" : "human";
      }
    }

    await this.endGame();
  }

  async executeHumanTurn() {
    try {
      const coordinate = await this.humanPlayer.makeMove(this.cpuBoard);
      const result = this.cpuBoard.processGuess(coordinate);

      if (result.alreadyGuessed) {
        this.gameIO.displayMessage("You already guessed that location!");
        return;
      }

      this.gameIO.displayPlayerGuessResult(result.hit, result.sunk);
    } catch (error) {
      this.gameIO.displayMessage(`Error during human turn: ${error.message}`);
    }
  }

  async executeCPUTurn() {
    try {
      const coordinate = await this.cpuPlayer.makeMove(this.playerBoard);
      const result = this.playerBoard.processGuess(coordinate);
      this.gameIO.displayCPUGuessResult(coordinate, result.hit, result.sunk);
    } catch (error) {
      this.gameIO.displayMessage(`Error during CPU turn: ${error.message}`);
    }
  }

  checkGameOver() {
    if (this.humanPlayer.hasLost()) {
      this.gameOver = true;
      this.winner = "cpu";
    } else if (this.cpuPlayer.hasLost()) {
      this.gameOver = true;
      this.winner = "human";
    }
  }

  async endGame() {
    this.gameIO.displayBoards(this.cpuBoard, this.playerBoard);
    this.gameIO.displayGameOver(this.winner === "human");

    const playerShipsRemaining = this.humanPlayer.getRemainingShips();
    const cpuShipsRemaining = this.cpuPlayer.getRemainingShips();

    this.gameIO.displayMessage(`\nFinal Score:`);
    this.gameIO.displayMessage(`Your ships remaining: ${playerShipsRemaining}`);
    this.gameIO.displayMessage(`CPU ships remaining: ${cpuShipsRemaining}`);

    this.gameIO.close();
  }

  getGameState() {
    return {
      currentTurn: this.currentTurn,
      gameOver: this.gameOver,
      winner: this.winner,
      humanShipsRemaining: this.humanPlayer.getRemainingShips(),
      cpuShipsRemaining: this.cpuPlayer.getRemainingShips(),
      playerBoard: this.playerBoard.getDisplayGrid(false),
      opponentBoard: this.cpuBoard.getDisplayGrid(true),
    };
  }
}
