import { Board } from "../../src/models/Board.js";
import { Ship } from "../../src/models/Ship.js";

describe("Board", () => {
  let board;

  beforeEach(() => {
    board = new Board(10);
  });

  describe("constructor", () => {
    test("should create a board with default size 10", () => {
      const defaultBoard = new Board();
      expect(defaultBoard.size).toBe(10);
      expect(defaultBoard.grid).toHaveLength(10);
      expect(defaultBoard.grid[0]).toHaveLength(10);
    });

    test("should create a board with specified size", () => {
      const customBoard = new Board(5);
      expect(customBoard.size).toBe(5);
      expect(customBoard.grid).toHaveLength(5);
      expect(customBoard.grid[0]).toHaveLength(5);
    });

    test("should initialize grid with water", () => {
      expect(board.grid[0][0]).toBe(Board.WATER);
      expect(board.grid[9][9]).toBe(Board.WATER);
    });
  });

  describe("isValidCoordinate", () => {
    test("should return true for valid coordinates", () => {
      expect(board.isValidCoordinate(0, 0)).toBe(true);
      expect(board.isValidCoordinate(5, 5)).toBe(true);
      expect(board.isValidCoordinate(9, 9)).toBe(true);
    });

    test("should return false for invalid coordinates", () => {
      expect(board.isValidCoordinate(-1, 0)).toBe(false);
      expect(board.isValidCoordinate(0, -1)).toBe(false);
      expect(board.isValidCoordinate(10, 0)).toBe(false);
      expect(board.isValidCoordinate(0, 10)).toBe(false);
    });
  });

  describe("parseCoordinate", () => {
    test("should parse valid coordinate string", () => {
      const result = board.parseCoordinate("05");
      expect(result).toEqual({ row: 0, col: 5 });
    });

    test("should parse coordinate with zeros", () => {
      const result = board.parseCoordinate("00");
      expect(result).toEqual({ row: 0, col: 0 });
    });

    test("should throw error for invalid format", () => {
      expect(() => board.parseCoordinate("5")).toThrow(
        "Coordinate must be a 2-character string"
      );
      expect(() => board.parseCoordinate("123")).toThrow(
        "Coordinate must be a 2-character string"
      );
      expect(() => board.parseCoordinate("")).toThrow(
        "Coordinate must be a 2-character string"
      );
    });

    test("should throw error for non-digits", () => {
      expect(() => board.parseCoordinate("ab")).toThrow(
        "Coordinate must contain only digits"
      );
      expect(() => board.parseCoordinate("1a")).toThrow(
        "Coordinate must contain only digits"
      );
    });
  });

  describe("canPlaceShip", () => {
    test("should return true for valid placement", () => {
      const locations = ["00", "01", "02"];
      expect(board.canPlaceShip(locations)).toBe(true);
    });

    test("should return false for out of bounds placement", () => {
      const locations = ["aa", "bb", "cc"]; // Invalid coordinates
      expect(board.canPlaceShip(locations)).toBe(false);
    });

    test("should return false for collision with existing ship", () => {
      const ship = new Ship(3);
      ship.setLocations(["00", "01", "02"]);
      board.placeShip(ship);

      const newLocations = ["01", "11", "21"];
      expect(board.canPlaceShip(newLocations)).toBe(false);
    });
  });

  describe("placeShip", () => {
    test("should place ship successfully", () => {
      const ship = new Ship(3);
      ship.setLocations(["00", "01", "02"]);

      board.placeShip(ship, true);

      expect(board.ships).toContain(ship);
      expect(board.grid[0][0]).toBe(Board.SHIP);
      expect(board.grid[0][1]).toBe(Board.SHIP);
      expect(board.grid[0][2]).toBe(Board.SHIP);
    });

    test("should place ship without showing on grid", () => {
      const ship = new Ship(3);
      ship.setLocations(["00", "01", "02"]);

      board.placeShip(ship, false);

      expect(board.ships).toContain(ship);
      expect(board.grid[0][0]).toBe(Board.WATER);
      expect(board.grid[0][1]).toBe(Board.WATER);
      expect(board.grid[0][2]).toBe(Board.WATER);
    });

    test("should throw error for invalid placement", () => {
      const ship = new Ship(3);
      ship.setLocations(["98", "99", "9a"]); // Invalid coordinate format

      expect(() => board.placeShip(ship)).toThrow(
        "Cannot place ship at specified locations"
      );
    });
  });

  describe("processGuess", () => {
    let ship;

    beforeEach(() => {
      ship = new Ship(3);
      ship.setLocations(["00", "01", "02"]);
      board.placeShip(ship, false);
    });

    test("should process hit correctly", () => {
      const result = board.processGuess("01");

      expect(result).toEqual({
        hit: true,
        sunk: false,
        alreadyGuessed: false,
      });
      expect(board.grid[0][1]).toBe(Board.HIT);
      expect(board.guesses.has("01")).toBe(true);
    });

    test("should process miss correctly", () => {
      const result = board.processGuess("99");

      expect(result).toEqual({
        hit: false,
        sunk: false,
        alreadyGuessed: false,
      });
      expect(board.grid[9][9]).toBe(Board.MISS);
      expect(board.guesses.has("99")).toBe(true);
    });

    test("should detect sunk ship", () => {
      board.processGuess("00");
      board.processGuess("01");
      const result = board.processGuess("02");

      expect(result).toEqual({
        hit: true,
        sunk: true,
        alreadyGuessed: false,
      });
    });

    test("should handle repeated guess", () => {
      board.processGuess("01");
      const result = board.processGuess("01");

      expect(result).toEqual({
        hit: false,
        sunk: false,
        alreadyGuessed: true,
      });
    });
  });

  describe("getShipsRemaining", () => {
    test("should return correct count of remaining ships", () => {
      const ship1 = new Ship(3);
      ship1.setLocations(["00", "01", "02"]);
      const ship2 = new Ship(3);
      ship2.setLocations(["10", "11", "12"]);

      board.placeShip(ship1, false);
      board.placeShip(ship2, false);

      expect(board.getShipsRemaining()).toBe(2);

      // Sink first ship
      board.processGuess("00");
      board.processGuess("01");
      board.processGuess("02");

      expect(board.getShipsRemaining()).toBe(1);
    });
  });

  describe("getDisplayGrid", () => {
    let ship;

    beforeEach(() => {
      ship = new Ship(3);
      ship.setLocations(["00", "01", "02"]);
      board.placeShip(ship, true);
      board.processGuess("01"); // Hit
      board.processGuess("99"); // Miss
    });

    test("should return grid with ships visible", () => {
      const displayGrid = board.getDisplayGrid(false);

      expect(displayGrid[0][0]).toBe(Board.SHIP);
      expect(displayGrid[0][1]).toBe(Board.HIT);
      expect(displayGrid[0][2]).toBe(Board.SHIP);
      expect(displayGrid[9][9]).toBe(Board.MISS);
    });

    test("should return grid with ships hidden", () => {
      const displayGrid = board.getDisplayGrid(true);

      expect(displayGrid[0][0]).toBe(Board.WATER);
      expect(displayGrid[0][1]).toBe(Board.HIT);
      expect(displayGrid[0][2]).toBe(Board.WATER);
      expect(displayGrid[9][9]).toBe(Board.MISS);
    });
  });

  describe("generateRandomShipLocations", () => {
    test("should generate valid horizontal ship locations", () => {
      // Mock Math.random to force horizontal placement at specific location
      const originalRandom = Math.random;
      Math.random = jest
        .fn()
        .mockReturnValueOnce(0.3) // horizontal
        .mockReturnValueOnce(0.2) // row 2 (Math.floor(0.2 * 10) = 2)
        .mockReturnValueOnce(0.0); // col 0 (Math.floor(0.0 * 8) = 0) for ship length 3 in size 10

      const locations = board.generateRandomShipLocations(3);

      expect(locations).toHaveLength(3);
      expect(locations).toEqual(["20", "21", "22"]);

      Math.random = originalRandom;
    });

    test("should generate valid vertical ship locations", () => {
      // Mock Math.random to force vertical placement at specific location
      const originalRandom = Math.random;
      Math.random = jest
        .fn()
        .mockReturnValueOnce(0.7) // vertical
        .mockReturnValueOnce(0.2) // row 1
        .mockReturnValueOnce(0.1); // col 1

      const locations = board.generateRandomShipLocations(3);

      expect(locations).toHaveLength(3);
      expect(locations).toEqual(["11", "21", "31"]);

      Math.random = originalRandom;
    });

    test("should throw error after maximum attempts", () => {
      // Fill the board to make placement impossible
      for (let i = 0; i < board.size; i++) {
        for (let j = 0; j < board.size; j++) {
          board.grid[i][j] = Board.SHIP;
        }
      }

      expect(() => board.generateRandomShipLocations(3)).toThrow(
        "Could not find valid placement for ship after maximum attempts"
      );
    });
  });
});
