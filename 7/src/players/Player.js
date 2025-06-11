import { Ship } from "../models/Ship.js";

/**
 * Base class for players in the Sea Battle game
 */
export class Player {
  constructor(name, board) {
    this.name = name;
    this.board = board;
  }

  /**
   * Makes a move - to be implemented by subclasses
   * @param {Board} opponentBoard - The opponent's board
   * @returns {Promise<string>} - The coordinate to attack
   */
  async makeMove(opponentBoard) {
    throw new Error("makeMove must be implemented by subclasses");
  }

  /**
   * Places ships on the player's board
   * @param {number} numShips - Number of ships to place
   * @param {number} shipLength - Length of each ship
   */
  placeShips(numShips, shipLength) {
    for (let i = 0; i < numShips; i++) {
      const locations = this.board.generateRandomShipLocations(shipLength);
      const ship = new Ship(shipLength);
      ship.setLocations(locations);
      this.board.placeShip(ship, this.name === "Player");
    }
  }

  /**
   * Gets the number of remaining ships
   * @returns {number} - Number of ships still afloat
   */
  getRemainingShips() {
    return this.board.getShipsRemaining();
  }

  /**
   * Checks if the player has lost (all ships sunk)
   * @returns {boolean} - True if all ships are sunk
   */
  hasLost() {
    return this.getRemainingShips() === 0;
  }
}

/**
 * Human player implementation
 */
export class HumanPlayer extends Player {
  constructor(board, gameIO) {
    super("Player", board);
    this.gameIO = gameIO;
  }

  /**
   * Gets move from human input
   * @param {Board} opponentBoard - The opponent's board
   * @returns {Promise<string>} - The coordinate to attack
   */
  async makeMove(opponentBoard) {
    while (true) {
      const input = await this.gameIO.getInput("Enter your guess (e.g., 00): ");

      if (!input || input.length !== 2) {
        this.gameIO.displayMessage(
          "Oops, input must be exactly two digits (e.g., 00, 34, 98)."
        );
        continue;
      }

      try {
        const { row, col } = opponentBoard.parseCoordinate(input);

        if (!opponentBoard.isValidCoordinate(row, col)) {
          this.gameIO.displayMessage(
            `Oops, please enter valid row and column numbers between 0 and ${
              opponentBoard.size - 1
            }.`
          );
          continue;
        }

        if (opponentBoard.guesses.has(input)) {
          this.gameIO.displayMessage("You already guessed that location!");
          continue;
        }

        return input;
      } catch (error) {
        this.gameIO.displayMessage(
          "Invalid input. Please enter two digits (e.g., 05, 34)."
        );
      }
    }
  }
}

/**
 * CPU player with hunt and target AI modes
 */
export class CPUPlayer extends Player {
  constructor(board) {
    super("CPU", board);
    this.mode = "hunt";
    this.targetQueue = [];
    this.lastHit = null;
  }

  /**
   * Makes a move using AI logic
   * @param {Board} opponentBoard - The opponent's board
   * @returns {Promise<string>} - The coordinate to attack
   */
  async makeMove(opponentBoard) {
    let coordinate;

    if (this.mode === "target" && this.targetQueue.length > 0) {
      coordinate = this.targetQueue.shift();
      if (opponentBoard.guesses.has(coordinate)) {
        if (this.targetQueue.length === 0) this.mode = "hunt";
        return this.makeMove(opponentBoard);
      }
    } else {
      this.mode = "hunt";
      coordinate = this.findRandomTarget(opponentBoard);
    }

    const result = opponentBoard.processGuess(coordinate);

    if (result.hit) {
      this.lastHit = coordinate;
      if (result.sunk) {
        this.mode = "hunt";
        this.targetQueue = [];
      } else {
        this.mode = "target";
        this.addAdjacentTargets(coordinate, opponentBoard);
      }
    } else if (this.mode === "target" && this.targetQueue.length === 0) {
      this.mode = "hunt";
    }

    return coordinate;
  }

  /**
   * Finds a random valid target
   * @param {Board} opponentBoard - The opponent's board
   * @returns {string} - Random coordinate string
   */
  findRandomTarget(opponentBoard) {
    let coordinate;
    do {
      const row = Math.floor(Math.random() * opponentBoard.size);
      const col = Math.floor(Math.random() * opponentBoard.size);
      coordinate = `${row}${col}`;
    } while (opponentBoard.guesses.has(coordinate));
    return coordinate;
  }

  /**
   * Adds adjacent cells to target queue
   * @param {string} coordinate - The coordinate that was hit
   * @param {Board} opponentBoard - The opponent's board
   */
  addAdjacentTargets(coordinate, opponentBoard) {
    const { row, col } = opponentBoard.parseCoordinate(coordinate);
    const adjacent = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ];

    for (const adj of adjacent) {
      if (opponentBoard.isValidCoordinate(adj.row, adj.col)) {
        const adjCoordinate = `${adj.row}${adj.col}`;
        if (
          !opponentBoard.guesses.has(adjCoordinate) &&
          !this.targetQueue.includes(adjCoordinate)
        ) {
          this.targetQueue.push(adjCoordinate);
        }
      }
    }
  }
}
