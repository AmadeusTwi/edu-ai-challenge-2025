import { SeaBattleGame } from "./game/SeaBattleGame.js";
import { pathToFileURL } from "url";

/**
 * Main entry point for the Sea Battle game
 */
async function main() {
  try {
    const game = new SeaBattleGame({
      boardSize: 10,
      numShips: 3,
      shipLength: 3,
    });

    await game.play();
  } catch (error) {
    console.error("Fatal error:", error.message);
    process.exit(1);
  }
}

// Start the game
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
