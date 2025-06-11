import { SeaBattleGame } from "../../src/game/SeaBattleGame.js";
import { GameIO } from "../../src/io/GameIO.js";

// Mock GameIO to avoid actual console output and input
jest.mock("../../src/io/GameIO.js");

describe("SeaBattleGame", () => {
  let game;
  let mockGameIO;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a mock GameIO instance
    mockGameIO = {
      displayMessage: jest.fn(),
      displayWelcome: jest.fn(),
      displayBoards: jest.fn(),
      displayPlayerGuessResult: jest.fn(),
      displayCPUGuessResult: jest.fn(),
      displayGameOver: jest.fn(),
      getInput: jest.fn(),
      close: jest.fn(),
    };

    // Mock the GameIO constructor to return our mock
    GameIO.mockImplementation(() => mockGameIO);

    game = new SeaBattleGame();
  });

  describe("constructor", () => {
    test("should create game with default configuration", () => {
      expect(game.boardSize).toBe(10);
      expect(game.numShips).toBe(3);
      expect(game.shipLength).toBe(3);
      expect(game.currentTurn).toBe("human");
      expect(game.gameOver).toBe(false);
      expect(game.winner).toBeNull();
    });

    test("should create game with custom configuration", () => {
      const customGame = new SeaBattleGame({
        boardSize: 5,
        numShips: 2,
        shipLength: 2,
      });

      expect(customGame.boardSize).toBe(5);
      expect(customGame.numShips).toBe(2);
      expect(customGame.shipLength).toBe(2);
    });

    test("should initialize with correct initial state", () => {
      expect(game.playerBoard).toBeDefined();
      expect(game.cpuBoard).toBeDefined();
      expect(game.humanPlayer).toBeDefined();
      expect(game.cpuPlayer).toBeDefined();
      expect(game.gameIO).toBeDefined();
    });
  });

  describe("initialize", () => {
    test("should initialize game successfully", async () => {
      const result = await game.initialize();

      expect(result).toBe(true);
      expect(game.playerBoard.ships).toHaveLength(3);
      expect(game.cpuBoard.ships).toHaveLength(3);
      expect(mockGameIO.displayMessage).toHaveBeenCalledWith(
        "Setting up the game..."
      );
      expect(mockGameIO.displayMessage).toHaveBeenCalledWith(
        "3 ships placed for both players."
      );
      expect(mockGameIO.displayWelcome).toHaveBeenCalledWith(3);
    });

    test("should handle initialization errors", async () => {
      // Mock an error during ship placement
      const originalPlaceShips = game.humanPlayer.placeShips;
      game.humanPlayer.placeShips = jest.fn(() => {
        throw new Error("Ship placement failed");
      });

      const result = await game.initialize();

      expect(result).toBe(false);
      expect(mockGameIO.displayMessage).toHaveBeenCalledWith(
        "Error initializing game: Ship placement failed"
      );

      // Restore original method
      game.humanPlayer.placeShips = originalPlaceShips;
    });
  });

  describe("play", () => {
    test("should handle failed initialization", async () => {
      // Mock initialize to return false
      jest.spyOn(game, "initialize").mockResolvedValue(false);

      await game.play();

      expect(mockGameIO.close).toHaveBeenCalled();
    });

    test("should execute complete game flow", async () => {
      // Mock initialize to return true
      jest.spyOn(game, "initialize").mockResolvedValue(true);

      // Mock game methods
      jest.spyOn(game, "executeHumanTurn").mockResolvedValue();
      jest.spyOn(game, "executeCPUTurn").mockResolvedValue();
      jest.spyOn(game, "checkGameOver").mockImplementation(() => {
        // End game after one iteration
        game.gameOver = true;
        game.winner = "human";
      });
      jest.spyOn(game, "endGame").mockResolvedValue();

      await game.play();

      expect(game.initialize).toHaveBeenCalled();
      expect(mockGameIO.displayBoards).toHaveBeenCalled();
      expect(game.executeHumanTurn).toHaveBeenCalled();
      expect(game.checkGameOver).toHaveBeenCalled();
      expect(game.endGame).toHaveBeenCalled();
    });

    test("should alternate between human and CPU turns", async () => {
      jest.spyOn(game, "initialize").mockResolvedValue(true);
      jest.spyOn(game, "executeHumanTurn").mockResolvedValue();
      jest.spyOn(game, "executeCPUTurn").mockResolvedValue();
      jest.spyOn(game, "endGame").mockResolvedValue();

      let turnCount = 0;
      jest.spyOn(game, "checkGameOver").mockImplementation(() => {
        turnCount++;
        if (turnCount >= 4) {
          // End after 2 complete cycles
          game.gameOver = true;
          game.winner = "human";
        }
      });

      await game.play();

      expect(game.executeHumanTurn).toHaveBeenCalledTimes(2);
      expect(game.executeCPUTurn).toHaveBeenCalledTimes(2);
    });
  });

  describe("executeHumanTurn", () => {
    beforeEach(async () => {
      await game.initialize();
      // Mock getInput to return a valid coordinate
      mockGameIO.getInput.mockResolvedValue("05");
    });

    test("should execute human turn successfully", async () => {
      jest.spyOn(game.humanPlayer, "makeMove").mockResolvedValue("05");

      await game.executeHumanTurn();

      expect(game.humanPlayer.makeMove).toHaveBeenCalledWith(game.cpuBoard);
      expect(mockGameIO.displayPlayerGuessResult).toHaveBeenCalled();
    });

    test("should handle already guessed location", async () => {
      // Make the same guess twice
      game.cpuBoard.processGuess("05");
      jest.spyOn(game.humanPlayer, "makeMove").mockResolvedValue("05");

      await game.executeHumanTurn();

      expect(mockGameIO.displayMessage).toHaveBeenCalledWith(
        "You already guessed that location!"
      );
    });

    test("should handle errors during human turn", async () => {
      jest
        .spyOn(game.humanPlayer, "makeMove")
        .mockRejectedValue(new Error("Input error"));

      await game.executeHumanTurn();

      expect(mockGameIO.displayMessage).toHaveBeenCalledWith(
        "Error during human turn: Input error"
      );
    });
  });

  describe("executeCPUTurn", () => {
    beforeEach(async () => {
      await game.initialize();
    });

    test("should execute CPU turn successfully", async () => {
      await game.executeCPUTurn();

      expect(mockGameIO.displayCPUGuessResult).toHaveBeenCalled();
      // Check that a guess was made
      expect(game.playerBoard.guesses.size).toBeGreaterThan(0);
    });

    test("should handle errors during CPU turn", async () => {
      jest
        .spyOn(game.cpuPlayer, "makeMove")
        .mockRejectedValue(new Error("CPU error"));

      await game.executeCPUTurn();

      expect(mockGameIO.displayMessage).toHaveBeenCalledWith(
        "Error during CPU turn: CPU error"
      );
    });
  });

  describe("endGame", () => {
    beforeEach(async () => {
      await game.initialize();
      game.gameOver = true;
      game.winner = "human";
    });

    test("should display end game information", async () => {
      await game.endGame();

      expect(mockGameIO.displayBoards).toHaveBeenCalledWith(
        game.cpuBoard,
        game.playerBoard
      );
      expect(mockGameIO.displayGameOver).toHaveBeenCalledWith(true);
      expect(mockGameIO.displayMessage).toHaveBeenCalledWith("\nFinal Score:");
      expect(mockGameIO.displayMessage).toHaveBeenCalledWith(
        "Your ships remaining: 3"
      );
      expect(mockGameIO.displayMessage).toHaveBeenCalledWith(
        "CPU ships remaining: 3"
      );
      expect(mockGameIO.close).toHaveBeenCalled();
    });

    test("should display correct winner information for CPU victory", async () => {
      game.winner = "cpu";

      await game.endGame();

      expect(mockGameIO.displayGameOver).toHaveBeenCalledWith(false);
    });
  });

  describe("checkGameOver", () => {
    beforeEach(async () => {
      await game.initialize();
    });

    test("should detect human player victory", () => {
      // Sink all CPU ships
      for (const ship of game.cpuBoard.ships) {
        for (const location of ship.locations) {
          ship.hit(location);
        }
      }

      // Verify ships are actually sunk
      expect(game.cpuBoard.getShipsRemaining()).toBe(0);

      game.checkGameOver();

      expect(game.gameOver).toBe(true);
      expect(game.winner).toBe("human");
    });

    test("should detect CPU victory", () => {
      // Sink all player ships
      for (const ship of game.playerBoard.ships) {
        for (const location of ship.locations) {
          game.playerBoard.processGuess(location);
        }
      }

      game.checkGameOver();

      expect(game.gameOver).toBe(true);
      expect(game.winner).toBe("cpu");
    });

    test("should not end game when ships remain", () => {
      game.checkGameOver();

      expect(game.gameOver).toBe(false);
      expect(game.winner).toBeNull();
    });
  });

  describe("getGameState", () => {
    beforeEach(async () => {
      await game.initialize();
    });

    test("should return current game state", () => {
      const state = game.getGameState();

      expect(state).toHaveProperty("currentTurn", "human");
      expect(state).toHaveProperty("gameOver", false);
      expect(state).toHaveProperty("winner", null);
      expect(state).toHaveProperty("humanShipsRemaining");
      expect(state).toHaveProperty("cpuShipsRemaining");
      expect(state).toHaveProperty("playerBoard");
      expect(state).toHaveProperty("opponentBoard");

      expect(state.humanShipsRemaining).toBe(3);
      expect(state.cpuShipsRemaining).toBe(3);
      expect(Array.isArray(state.playerBoard)).toBe(true);
      expect(Array.isArray(state.opponentBoard)).toBe(true);
    });

    test("should reflect game state changes", () => {
      // Simulate a move by manually changing turn
      game.currentTurn = "cpu";

      const state = game.getGameState();
      expect(state.currentTurn).toBe("cpu");
    });
  });

  describe("game flow integration", () => {
    beforeEach(async () => {
      await game.initialize();
    });

    test("should simulate turn changes", () => {
      const initialState = game.getGameState();
      expect(initialState.currentTurn).toBe("human");

      // Simulate human move
      game.currentTurn = "cpu";
      expect(game.currentTurn).toBe("cpu");

      // Simulate CPU move
      game.currentTurn = "human";
      expect(game.currentTurn).toBe("human");
    });

    test("should handle game end correctly", () => {
      // Manually set up end game condition
      for (const ship of game.cpuBoard.ships) {
        for (const location of ship.locations) {
          ship.hit(location);
        }
      }

      game.checkGameOver();

      expect(game.gameOver).toBe(true);
      expect(game.winner).toBe("human");
    });
  });

  describe("configuration flexibility", () => {
    test("should work with different board sizes", async () => {
      const smallGame = new SeaBattleGame({
        boardSize: 5,
        numShips: 1,
        shipLength: 2,
      });
      const result = await smallGame.initialize();

      expect(result).toBe(true);
      expect(smallGame.playerBoard.ships).toHaveLength(1);
      expect(smallGame.cpuBoard.ships).toHaveLength(1);
    });

    test("should work with different ship configurations", async () => {
      const customGame = new SeaBattleGame({
        boardSize: 8,
        numShips: 5,
        shipLength: 2,
      });
      const result = await customGame.initialize();

      expect(result).toBe(true);
      expect(customGame.playerBoard.ships).toHaveLength(5);
      expect(customGame.cpuBoard.ships).toHaveLength(5);

      customGame.playerBoard.ships.forEach((ship) => {
        expect(ship.length).toBe(2);
      });
    });
  });
});
