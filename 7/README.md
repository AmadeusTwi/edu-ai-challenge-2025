# Sea Battle Game

A modern, optimized implementation of the classic Battleship game built with ES6+ JavaScript.

## Features

- **Modern JavaScript (ES6+)**: Uses classes, modules, async/await, and other modern features
- **Clean Architecture**: Proper separation of concerns with MVC pattern
- **CPU AI**: Intelligent opponent with hunt and target modes
- **Static Constants**: Clear board cell type definitions for better readability
- **Configurable**: Customizable board size, ship count, and ship length
- **Turn-based Gameplay**: Classic battleship mechanics preserved

## Installation

```bash
npm install
```

## Usage

### Running the Game
```bash
npm start
```

### Running Tests
```bash
npm test
npm run test:coverage
npm run test:watch
```

## Game Rules

1. **Objective**: Sink all enemy ships before the CPU sinks yours
2. **Board**: 10x10 grid with coordinates from 00 to 99
3. **Ships**: 3 ships of length 3 are placed randomly for both players
4. **Input**: Enter coordinates as two digits (e.g., "05", "34", "98")
5. **Symbols**: 
   - `~` = Water (Board.WATER)
   - `S` = Your ship (Board.SHIP)
   - `X` = Hit (Board.HIT)
   - `O` = Miss (Board.MISS)

## Architecture

```
src/
├── models/
│   ├── Ship.js          # Ship entity with state management
│   └── Board.js         # Game board with grid operations
├── players/
│   └── Player.js        # Player implementations (Human/CPU)
├── game/
│   └── SeaBattleGame.js # Main game controller
├── io/
│   └── GameIO.js        # Input/output handling
└── index.js             # Application entry point
```

## Key Classes

### Ship
Represents individual ships with hit tracking and sunk status.

### Board
Manages the game grid, ship placement, and guess processing. Uses static constants:
- `Board.WATER` - Water cells (~)
- `Board.SHIP` - Ship cells (S)
- `Board.HIT` - Hit cells (X)
- `Board.MISS` - Miss cells (O)

### HumanPlayer
Handles human input with validation and error handling.

### CPUPlayer
AI opponent with intelligent hunt and target algorithms.

### SeaBattleGame
Main game controller coordinating all components.

### GameIO
Handles all input/output operations and display formatting.

## Configuration

The game can be configured by modifying the constructor parameters in `src/index.js`:

```javascript
const game = new SeaBattleGame({
  boardSize: 10,    // Board dimensions (10x10)
  numShips: 3,      // Number of ships per player
  shipLength: 3     // Length of each ship
});
```


## License

MIT License

## Refactoring Notes

This project was refactored and optimized from a monolithic JavaScript file to a modern, modular architecture. See `refactoring.md` for detailed information about the transformation process. 