const readline = require("readline");

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function mod(n, m) {
  return ((n % m) + m) % m;
}

const ROTORS = [
  { wiring: "EKMFLGDQVZNTOWYHXUSPAIBRCJ", notch: "Q" }, // Rotor I
  { wiring: "AJDKSIRUXBLHWTMCQGZNPYFVOE", notch: "E" }, // Rotor II
  { wiring: "BDFHJLCPRTXVZNYEIWGAKMUSQO", notch: "V" }, // Rotor III
];
const REFLECTOR = "YRUHQSLDPXNGOKMIEBFZCWVJAT";

function plugboardSwap(c, pairs) {
  for (const [a, b] of pairs) {
    if (c === a) return b;
    if (c === b) return a;
  }
  return c;
}

class Rotor {
  constructor(wiring, notch, ringSetting = 0, position = 0) {
    this.wiring = wiring;
    this.notch = notch;
    this.ringSetting = ringSetting;
    this.position = position;
  }
  step() {
    this.position = mod(this.position + 1, 26);
  }
  atNotch() {
    return alphabet[this.position] === this.notch;
  }
  forward(c) {
    const idx = mod(alphabet.indexOf(c) + this.position - this.ringSetting, 26);
    return this.wiring[idx];
  }
  backward(c) {
    const idx = this.wiring.indexOf(c);
    return alphabet[mod(idx - this.position + this.ringSetting, 26)];
  }
}

class Enigma {
  constructor(rotorIDs, rotorPositions, ringSettings, plugboardPairs) {
    this.rotors = rotorIDs.map(
      (id, i) =>
        new Rotor(
          ROTORS[id].wiring,
          ROTORS[id].notch,
          ringSettings[i],
          rotorPositions[i]
        )
    );
    this.plugboardPairs = plugboardPairs;
  }
  stepRotors() {
    // Check for double stepping: if middle rotor is at notch, both middle and left step
    const middleAtNotch = this.rotors[1].atNotch();
    const rightAtNotch = this.rotors[2].atNotch();

    // Left rotor steps if middle rotor is at notch
    if (middleAtNotch) {
      this.rotors[0].step();
    }

    // Middle rotor steps if it's at notch (double stepping) OR if right rotor is at notch
    if (middleAtNotch || rightAtNotch) {
      this.rotors[1].step();
    }

    // Right rotor always steps
    this.rotors[2].step();
  }
  encryptChar(c) {
    if (!alphabet.includes(c)) return c;
    this.stepRotors();

    // Forward pass through plugboard
    c = plugboardSwap(c, this.plugboardPairs);

    // Forward pass through rotors (right to left)
    for (let i = this.rotors.length - 1; i >= 0; i--) {
      c = this.rotors[i].forward(c);
    }

    // Reflector
    c = REFLECTOR[alphabet.indexOf(c)];

    // Backward pass through rotors (left to right)
    for (let i = 0; i < this.rotors.length; i++) {
      c = this.rotors[i].backward(c);
    }

    // Backward pass through plugboard
    c = plugboardSwap(c, this.plugboardPairs);

    return c;
  }
  process(text) {
    return text
      .toUpperCase()
      .split("")
      .map((c) => this.encryptChar(c))
      .join("");
  }
}

function promptEnigma() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter message: ", (message) => {
    rl.question("Rotor positions (e.g. 0 0 0): ", (posStr) => {
      const rotorPositions = posStr.split(" ").map(Number);
      rl.question("Ring settings (e.g. 0 0 0): ", (ringStr) => {
        const ringSettings = ringStr.split(" ").map(Number);
        rl.question("Plugboard pairs (e.g. AB CD): ", (plugStr) => {
          const plugPairs =
            plugStr
              .toUpperCase()
              .match(/([A-Z]{2})/g)
              ?.map((pair) => [pair[0], pair[1]]) || [];

          const enigma = new Enigma(
            [0, 1, 2],
            rotorPositions,
            ringSettings,
            plugPairs
          );
          const result = enigma.process(message);
          console.log("Output:", result);
          rl.close();
        });
      });
    });
  });
}

if (require.main === module) {
  promptEnigma();
}

// Export classes and functions for testing
module.exports = { Enigma, Rotor, plugboardSwap, ROTORS, REFLECTOR, alphabet };
