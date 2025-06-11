/**
 * Represents a game board in the Sea Battle game
 */
export class Board {
  static WATER = "~";
  static SHIP = "S";
  static HIT = "X";
  static MISS = "O";

  constructor(size = 10) {
    this.size = size;
    this.grid = Array(size)
      .fill(null)
      .map(() => Array(size).fill(Board.WATER));
    this.ships = [];
    this.guesses = new Set();
  }

  /**
   * Converts coordinate string to row/col numbers
   * @param {string} coordinate - Coordinate string like '05'
   * @returns {{row: number, col: number}} - Parsed coordinates
   */
  parseCoordinate(coordinate) {
    if (typeof coordinate !== "string" || coordinate.length !== 2) {
      throw new Error("Coordinate must be a 2-character string");
    }
    const row = parseInt(coordinate[0], 10);
    const col = parseInt(coordinate[1], 10);
    if (isNaN(row) || isNaN(col)) {
      throw new Error("Coordinate must contain only digits");
    }
    return { row, col };
  }

  /**
   * Validates if coordinates are within board bounds
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @returns {boolean} - True if coordinates are valid
   */
  isValidCoordinate(row, col) {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  /**
   * Checks if a location can place a ship (no collision)
   * @param {Array<string>} locations - Array of location strings
   * @returns {boolean} - True if placement is valid
   */
  canPlaceShip(locations) {
    return locations.every((location) => {
      try {
        const { row, col } = this.parseCoordinate(location);
        return (
          this.isValidCoordinate(row, col) &&
          this.grid[row][col] === Board.WATER
        );
      } catch {
        return false;
      }
    });
  }

  /**
   * Places a ship on the board
   * @param {Ship} ship - The ship to place
   * @param {boolean} showOnGrid - Whether to mark ship locations on the grid
   */
  placeShip(ship, showOnGrid = true) {
    if (!this.canPlaceShip(ship.locations)) {
      throw new Error("Cannot place ship at specified locations");
    }
    this.ships.push(ship);
    if (showOnGrid) {
      ship.locations.forEach((location) => {
        const { row, col } = this.parseCoordinate(location);
        this.grid[row][col] = Board.SHIP;
      });
    }
  }

  /**
   * Processes a guess and returns the result
   * @param {string} coordinate - The coordinate to guess
   * @returns {{hit: boolean, sunk: boolean, alreadyGuessed: boolean}} - Result of the guess
   */
  processGuess(coordinate) {
    if (this.guesses.has(coordinate)) {
      return { hit: false, sunk: false, alreadyGuessed: true };
    }

    this.guesses.add(coordinate);
    const { row, col } = this.parseCoordinate(coordinate);

    for (const ship of this.ships) {
      if (ship.hit(coordinate)) {
        this.grid[row][col] = Board.HIT;
        return { hit: true, sunk: ship.isSunk(), alreadyGuessed: false };
      }
    }

    this.grid[row][col] = Board.MISS;
    return { hit: false, sunk: false, alreadyGuessed: false };
  }

  /**
   * Gets the number of ships that are still afloat
   * @returns {number} - Number of unsunk ships
   */
  getShipsRemaining() {
    return this.ships.filter((ship) => !ship.isSunk()).length;
  }

  /**
   * Gets a display representation of the board
   * @param {boolean} hideShips - Whether to hide ship locations
   * @returns {Array<Array<string>>} - Display grid
   */
  getDisplayGrid(hideShips = false) {
    if (!hideShips) return this.grid.map((row) => [...row]);
    return this.grid.map((row) =>
      row.map((cell) => (cell === Board.SHIP ? Board.WATER : cell))
    );
  }

  /**
   * Generates random ship locations
   * @param {number} shipLength - Length of the ship
   * @returns {Array<string>} - Array of location strings
   */
  generateRandomShipLocations(shipLength) {
    const maxAttempts = 100;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const horizontal = Math.random() < 0.5;
      const startRow = horizontal
        ? Math.floor(Math.random() * this.size)
        : Math.floor(Math.random() * (this.size - shipLength + 1));
      const startCol = horizontal
        ? Math.floor(Math.random() * (this.size - shipLength + 1))
        : Math.floor(Math.random() * this.size);

      const locations = [];
      for (let i = 0; i < shipLength; i++) {
        const row = horizontal ? startRow : startRow + i;
        const col = horizontal ? startCol + i : startCol;
        locations.push(`${row}${col}`);
      }

      if (this.canPlaceShip(locations)) return locations;
      attempts++;
    }

    throw new Error(
      "Could not find valid placement for ship after maximum attempts"
    );
  }
}
