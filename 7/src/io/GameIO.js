import readline from "readline";

export class GameIO {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  getInput(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  displayMessage(message) {
    console.log(message);
  }

  displayBoards(opponentBoard, playerBoard) {
    const opponentGrid = opponentBoard.getDisplayGrid(true);
    const playerGrid = playerBoard.getDisplayGrid(false);

    console.log("\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---");

    let header = "  ";
    for (let h = 0; h < opponentBoard.size; h++) {
      header += h + " ";
    }
    console.log(header + "     " + header);

    for (let i = 0; i < opponentBoard.size; i++) {
      let rowStr = i + " ";

      for (let j = 0; j < opponentBoard.size; j++) {
        rowStr += opponentGrid[i][j] + " ";
      }

      rowStr += "    " + i + " ";

      for (let j = 0; j < playerBoard.size; j++) {
        rowStr += playerGrid[i][j] + " ";
      }

      console.log(rowStr);
    }
    console.log("\n");
  }

  displayWelcome(numShips) {
    console.log("\n=== SEA BATTLE GAME ===");
    console.log(`Try to sink the ${numShips} enemy ships.`);
    console.log("Enter coordinates as two digits (e.g., 05, 34, 98)");
    console.log("~ = Water, S = Ship, X = Hit, O = Miss\n");
  }

  displayGameOver(playerWon) {
    if (playerWon) {
      console.log("\n*** CONGRATULATIONS! You sunk all enemy battleships! ***");
    } else {
      console.log("\n*** GAME OVER! The CPU sunk all your battleships! ***");
    }
  }

  displayPlayerGuessResult(hit, sunk) {
    if (hit) {
      console.log("PLAYER HIT!");
      if (sunk) {
        console.log("You sunk an enemy battleship!");
      }
    } else {
      console.log("PLAYER MISS.");
    }
  }

  displayCPUGuessResult(coordinate, hit, sunk) {
    console.log(`\n--- CPU's Turn ---`);
    if (hit) {
      console.log(`CPU HIT at ${coordinate}!`);
      if (sunk) {
        console.log("CPU sunk your battleship!");
      }
    } else {
      console.log(`CPU MISS at ${coordinate}.`);
    }
  }

  close() {
    this.rl.close();
  }
}
