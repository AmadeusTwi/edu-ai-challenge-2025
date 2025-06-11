import { Player, HumanPlayer, CPUPlayer } from "../../src/players/Player.js";
import { Board } from "../../src/models/Board.js";
import { Ship } from "../../src/models/Ship.js";

// Mock GameIO for HumanPlayer tests
const mockGameIO = {
  getInput: jest.fn(),
  displayMessage: jest.fn(),
};

describe("Player", () => {
  describe("Base Player", () => {
    let board;
    let player;

    beforeEach(() => {
      board = new Board(10);
      player = new Player("Test Player", board);
    });

    test("should create player with name and board", () => {
      expect(player.name).toBe("Test Player");
      expect(player.board).toBe(board);
    });

    test("should throw error when makeMove is called on base class", async () => {
      await expect(player.makeMove(board)).rejects.toThrow(
        "makeMove must be implemented by subclasses"
      );
    });

    test("should place ships correctly", () => {
      player.placeShips(2, 3);
      expect(board.ships).toHaveLength(2);
      board.ships.forEach((ship) => {
        expect(ship.length).toBe(3);
        expect(ship.locations).toHaveLength(3);
      });
    });

    test("should return correct remaining ships count", () => {
      player.placeShips(3, 2);
      expect(player.getRemainingShips()).toBe(3);

      // Sink one ship
      const ship = board.ships[0];
      ship.locations.forEach((location) => {
        ship.hit(location);
      });

      expect(player.getRemainingShips()).toBe(2);
    });

    test("should correctly identify if player has lost", () => {
      player.placeShips(2, 2);
      expect(player.hasLost()).toBe(false);

      // Sink all ships
      board.ships.forEach((ship) => {
        ship.locations.forEach((location) => {
          ship.hit(location);
        });
      });

      expect(player.hasLost()).toBe(true);
    });
  });

  describe("HumanPlayer", () => {
    let board;
    let opponentBoard;
    let humanPlayer;

    beforeEach(() => {
      board = new Board(10);
      opponentBoard = new Board(10);
      humanPlayer = new HumanPlayer(board, mockGameIO);
      jest.clearAllMocks();
    });

    test("should create human player with correct name", () => {
      expect(humanPlayer.name).toBe("Player");
      expect(humanPlayer.gameIO).toBe(mockGameIO);
    });

    test("should make valid move", async () => {
      mockGameIO.getInput.mockResolvedValue("05");

      const result = await humanPlayer.makeMove(opponentBoard);

      expect(result).toBe("05");
      expect(mockGameIO.getInput).toHaveBeenCalledWith(
        "Enter your guess (e.g., 00): "
      );
    });

    test("should reject invalid input length", async () => {
      mockGameIO.getInput
        .mockResolvedValueOnce("1") // Invalid length
        .mockResolvedValueOnce("05"); // Valid input

      const result = await humanPlayer.makeMove(opponentBoard);

      expect(result).toBe("05");
      expect(mockGameIO.displayMessage).toHaveBeenCalledWith(
        "Oops, input must be exactly two digits (e.g., 00, 34, 98)."
      );
    });

    test("should reject out of bounds coordinates", async () => {
      mockGameIO.getInput
        .mockResolvedValueOnce("aa") // Invalid parse - will trigger catch block
        .mockResolvedValueOnce("05"); // Valid input

      const result = await humanPlayer.makeMove(opponentBoard);

      expect(result).toBe("05");
      expect(mockGameIO.displayMessage).toHaveBeenCalledWith(
        "Invalid input. Please enter two digits (e.g., 05, 34)."
      );
    });

    test("should reject already guessed coordinates", async () => {
      opponentBoard.guesses.add("05");
      mockGameIO.getInput
        .mockResolvedValueOnce("05") // Already guessed
        .mockResolvedValueOnce("06"); // Valid input

      const result = await humanPlayer.makeMove(opponentBoard);

      expect(result).toBe("06");
      expect(mockGameIO.displayMessage).toHaveBeenCalledWith(
        "You already guessed that location!"
      );
    });

    test("should handle empty input", async () => {
      mockGameIO.getInput
        .mockResolvedValueOnce("") // Empty input
        .mockResolvedValueOnce("05"); // Valid input

      const result = await humanPlayer.makeMove(opponentBoard);

      expect(result).toBe("05");
      expect(mockGameIO.displayMessage).toHaveBeenCalledWith(
        "Oops, input must be exactly two digits (e.g., 00, 34, 98)."
      );
    });

    test("should handle parse error gracefully", async () => {
      mockGameIO.getInput
        .mockResolvedValueOnce("xy") // Invalid characters that will cause parseCoordinate to throw
        .mockResolvedValueOnce("05"); // Valid input

      const result = await humanPlayer.makeMove(opponentBoard);

      expect(result).toBe("05");
      expect(mockGameIO.displayMessage).toHaveBeenCalledWith(
        "Invalid input. Please enter two digits (e.g., 05, 34)."
      );
    });

    test("should handle null input", async () => {
      mockGameIO.getInput
        .mockResolvedValueOnce(null) // Null input
        .mockResolvedValueOnce("05"); // Valid input

      const result = await humanPlayer.makeMove(opponentBoard);

      expect(result).toBe("05");
      expect(mockGameIO.displayMessage).toHaveBeenCalledWith(
        "Oops, input must be exactly two digits (e.g., 00, 34, 98)."
      );
    });

    test("should handle out of bounds after parsing", async () => {
      // Create a smaller board to test actual out of bounds
      const smallBoard = new Board(5); // 5x5 board (0-4 range)
      mockGameIO.getInput
        .mockResolvedValueOnce("55") // Valid parse but out of bounds for 5x5 board
        .mockResolvedValueOnce("04"); // Valid input for 5x5 board

      const result = await humanPlayer.makeMove(smallBoard);

      expect(result).toBe("04");
      expect(mockGameIO.displayMessage).toHaveBeenCalledWith(
        "Oops, please enter valid row and column numbers between 0 and 4."
      );
    });
  });

  describe("CPUPlayer", () => {
    let board;
    let opponentBoard;
    let cpuPlayer;

    beforeEach(() => {
      board = new Board(10);
      opponentBoard = new Board(10);
      cpuPlayer = new CPUPlayer(board);

      // Place a ship on opponent board for testing
      const ship = new Ship(3);
      ship.setLocations(["00", "01", "02"]);
      opponentBoard.placeShip(ship, false);
    });

    test("should create CPU player with correct name and initial state", () => {
      expect(cpuPlayer.name).toBe("CPU");
      expect(cpuPlayer.mode).toBe("hunt");
      expect(cpuPlayer.targetQueue).toEqual([]);
      expect(cpuPlayer.lastHit).toBeNull();
    });

    test("should make random move in hunt mode", async () => {
      const coordinate = await cpuPlayer.makeMove(opponentBoard);

      expect(typeof coordinate).toBe("string");
      expect(coordinate).toMatch(/^\d\d$/);
      expect(opponentBoard.guesses.has(coordinate)).toBe(true);
    });

    test("should switch to target mode after hit", async () => {
      // Force a hit by making a move at ship location
      jest.spyOn(cpuPlayer, "findRandomTarget").mockReturnValue("01");

      const coordinate = await cpuPlayer.makeMove(opponentBoard);

      expect(coordinate).toBe("01");
      expect(cpuPlayer.mode).toBe("target");
      expect(cpuPlayer.lastHit).toBe("01");
      expect(cpuPlayer.targetQueue.length).toBeGreaterThan(0);
    });

    test("should return to hunt mode after sinking ship", async () => {
      // Hit all parts of the ship
      opponentBoard.processGuess("00");
      opponentBoard.processGuess("01");

      // Mock the CPU to hit the last part
      jest.spyOn(cpuPlayer, "findRandomTarget").mockReturnValue("02");

      cpuPlayer.mode = "target";
      const coordinate = await cpuPlayer.makeMove(opponentBoard);

      expect(coordinate).toBe("02");
      expect(cpuPlayer.mode).toBe("hunt");
      expect(cpuPlayer.targetQueue).toEqual([]);
    });

    test("should handle edge coordinates correctly", async () => {
      // Test corner position
      jest.spyOn(cpuPlayer, "findRandomTarget").mockReturnValue("99");

      await cpuPlayer.makeMove(opponentBoard);

      // Should only add valid adjacent targets
      const validTargets = cpuPlayer.targetQueue.filter((target) => {
        const { row, col } = opponentBoard.parseCoordinate(target);
        return opponentBoard.isValidCoordinate(row, col);
      });

      expect(validTargets.length).toBe(cpuPlayer.targetQueue.length);
    });

    test("should avoid already guessed coordinates in random search", async () => {
      // Fill most of the board with guesses
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 9; j++) {
          opponentBoard.guesses.add(`${i}${j}`);
        }
      }

      const coordinate = await cpuPlayer.makeMove(opponentBoard);

      // Should find one of the remaining valid coordinates
      expect(coordinate[1]).toBe("9"); // Last column
      expect(opponentBoard.guesses.has(coordinate)).toBe(true);
    });

    test("should use target queue when in target mode", async () => {
      cpuPlayer.mode = "target";
      cpuPlayer.targetQueue = ["33", "44"];

      const coordinate = await cpuPlayer.makeMove(opponentBoard);

      expect(coordinate).toBe("33");
      expect(cpuPlayer.targetQueue).toEqual(["44"]);
    });

    test("should switch back to hunt mode when target queue is empty", async () => {
      cpuPlayer.mode = "target";
      cpuPlayer.targetQueue = ["33"];

      // Mock a miss
      jest.spyOn(opponentBoard, "processGuess").mockReturnValue({
        hit: false,
        sunk: false,
        alreadyGuessed: false,
      });

      await cpuPlayer.makeMove(opponentBoard);

      expect(cpuPlayer.mode).toBe("hunt");
    });

    test("should handle already guessed coordinate in target mode", async () => {
      cpuPlayer.mode = "target";
      cpuPlayer.targetQueue = ["33", "44"];
      opponentBoard.guesses.add("33");

      const coordinate = await cpuPlayer.makeMove(opponentBoard);

      // Should recursively try next coordinate
      expect(coordinate).toBe("44");
    });

    test("should switch to hunt mode when target queue becomes empty during recursion", async () => {
      cpuPlayer.mode = "target";
      cpuPlayer.targetQueue = ["33"];
      opponentBoard.guesses.add("33");

      jest.spyOn(cpuPlayer, "findRandomTarget").mockReturnValue("55");

      const coordinate = await cpuPlayer.makeMove(opponentBoard);

      expect(coordinate).toBe("55");
      expect(cpuPlayer.mode).toBe("hunt");
    });

    test("should add adjacent targets after hit", () => {
      // Test the addAdjacentTargets method directly
      cpuPlayer.addAdjacentTargets("55", opponentBoard);

      const expectedTargets = ["45", "65", "54", "56"];
      expectedTargets.forEach((target) => {
        expect(cpuPlayer.targetQueue).toContain(target);
      });
    });

    test("should not add out of bounds targets", () => {
      // Test corner case
      cpuPlayer.addAdjacentTargets("00", opponentBoard);

      // Should only add valid adjacent targets (10, 01)
      expect(cpuPlayer.targetQueue).toEqual(
        expect.arrayContaining(["10", "01"])
      );
      expect(cpuPlayer.targetQueue.length).toBe(2);
    });

    test("should not add duplicate targets to queue", () => {
      cpuPlayer.targetQueue = ["54"];
      cpuPlayer.addAdjacentTargets("55", opponentBoard);

      // Should not have duplicate '54'
      const count54 = cpuPlayer.targetQueue.filter(
        (target) => target === "54"
      ).length;
      expect(count54).toBe(1);
    });
  });
});
