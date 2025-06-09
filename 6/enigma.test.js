const {
  Enigma,
  Rotor,
  plugboardSwap,
  ROTORS,
  REFLECTOR,
  alphabet,
} = require("./enigma.js");

// Simple test framework
const tests = [];
let passed = 0;
let failed = 0;

function test(name, testFn) {
  try {
    testFn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    not: {
      toBe: (expected) => {
        if (actual === expected) {
          throw new Error(`Expected not to be ${expected}, but got ${actual}`);
        }
      },
    },
  };
}

console.log("Running Enigma Machine Tests...\n");

// Test Rotor Class
console.log("=== Rotor Class Tests ===");

test("should initialize rotor correctly", () => {
  const rotor = new Rotor("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q", 0, 0);
  expect(rotor.wiring).toBe("EKMFLGDQVZNTOWYHXUSPAIBRCJ");
  expect(rotor.notch).toBe("Q");
  expect(rotor.ringSetting).toBe(0);
  expect(rotor.position).toBe(0);
});

test("should step rotor position correctly", () => {
  const rotor = new Rotor("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q", 0, 0);
  rotor.step();
  expect(rotor.position).toBe(1);

  // Test wrapping around
  rotor.position = 25;
  rotor.step();
  expect(rotor.position).toBe(0);
});

test("should detect notch position correctly", () => {
  const rotor = new Rotor("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q", 0, 16); // Q is at position 16
  expect(rotor.atNotch()).toBe(true);

  rotor.position = 15;
  expect(rotor.atNotch()).toBe(false);
});

test("should perform forward substitution correctly", () => {
  const rotor = new Rotor("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q", 0, 0);
  expect(rotor.forward("A")).toBe("E"); // A -> E at position 0
});

test("should perform backward substitution correctly", () => {
  const rotor = new Rotor("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q", 0, 0);
  expect(rotor.backward("E")).toBe("A"); // E -> A at position 0
});

// Test Plugboard Function
console.log("\n=== Plugboard Function Tests ===");

test("should swap letters correctly", () => {
  const pairs = [
    ["A", "B"],
    ["C", "D"],
  ];
  expect(plugboardSwap("A", pairs)).toBe("B");
  expect(plugboardSwap("B", pairs)).toBe("A");
  expect(plugboardSwap("C", pairs)).toBe("D");
  expect(plugboardSwap("D", pairs)).toBe("C");
  expect(plugboardSwap("E", pairs)).toBe("E"); // No swap
});

test("should handle empty plugboard pairs", () => {
  expect(plugboardSwap("A", [])).toBe("A");
});

// Test Enigma Machine
console.log("\n=== Enigma Machine Tests ===");

test("should initialize with correct settings", () => {
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  expect(enigma.rotors.length).toBe(3);
  expect(enigma.plugboardPairs.length).toBe(0);
});

test("should encrypt and decrypt reversibly", () => {
  // Test basic encryption/decryption symmetry
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);

  const plaintext = "HELLO";
  const encrypted = enigma1.process(plaintext);
  const decrypted = enigma2.process(encrypted);

  expect(decrypted).toBe(plaintext);
  expect(encrypted).not.toBe(plaintext); // Should be different
});

test("should handle double stepping correctly", () => {
  // Test the critical double stepping bug fix
  const enigma = new Enigma([0, 1, 2], [0, 4, 21], [0, 0, 0], []); // Middle rotor at notch-1 (E is at position 4)

  // First encryption should trigger double stepping
  const positions1 = enigma.rotors.map((r) => r.position);
  enigma.encryptChar("A");
  const positions2 = enigma.rotors.map((r) => r.position);

  // After double stepping: left rotor should step, middle should step, right should step
  expect(positions2[0]).toBe(positions1[0] + 1); // Left rotor stepped
  expect(positions2[1]).toBe(positions1[1] + 1); // Middle rotor stepped (double stepping)
  expect(positions2[2]).toBe(positions1[2] + 1); // Right rotor always steps
});

test("should handle right rotor at notch correctly", () => {
  // Test when right rotor is at notch (V is at position 21)
  const enigma = new Enigma([0, 1, 2], [0, 0, 21], [0, 0, 0], []);

  const positions1 = enigma.rotors.map((r) => r.position);
  enigma.encryptChar("A");
  const positions2 = enigma.rotors.map((r) => r.position);

  // Left rotor should not step, middle should step, right should step
  expect(positions2[0]).toBe(positions1[0]); // Left rotor doesn't step
  expect(positions2[1]).toBe(positions1[1] + 1); // Middle rotor steps
  expect(positions2[2]).toBe((positions1[2] + 1) % 26); // Right rotor steps (wraps around)
});

test("should handle plugboard correctly", () => {
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [["A", "B"]]);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [["A", "B"]]);

  const encrypted = enigma1.encryptChar("A"); // A gets swapped to B before encryption
  const decrypted = enigma2.encryptChar(encrypted);

  expect(decrypted).toBe("A");
});

test("should handle non-alphabetic characters", () => {
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const result = enigma.process("HELLO, WORLD! 123");

  // Non-alphabetic characters should pass through unchanged
  expect(result.includes(",")).toBe(true);
  expect(result.includes("!")).toBe(true);
  expect(result.includes(" ")).toBe(true);
  expect(result.includes("1")).toBe(true);
});

test("should handle lowercase input", () => {
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const result1 = enigma.process("hello");

  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const result2 = enigma2.process("HELLO");

  expect(result1).toBe(result2);
});

test("should produce consistent results with same settings", () => {
  const settings = {
    rotors: [0, 1, 2],
    positions: [5, 10, 15],
    rings: [0, 0, 0],
    plugs: [
      ["A", "B"],
      ["C", "D"],
    ],
  };

  const enigma1 = new Enigma(
    settings.rotors,
    settings.positions,
    settings.rings,
    settings.plugs
  );
  const enigma2 = new Enigma(
    settings.rotors,
    settings.positions,
    settings.rings,
    settings.plugs
  );

  const text = "TESTMESSAGE";
  const result1 = enigma1.process(text);
  const result2 = enigma2.process(text);

  expect(result1).toBe(result2);
});

test("should handle ring settings correctly", () => {
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [5, 10, 15], []);

  const result1 = enigma1.encryptChar("A");
  const result2 = enigma2.encryptChar("A");

  // Different ring settings should produce different results
  expect(result1).not.toBe(result2);
});

test("should handle empty string", () => {
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  expect(enigma.process("")).toBe("");
});

// Test Results
console.log("\n=== Test Results ===");
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log(`Total tests: ${passed + failed}`);
console.log(`Coverage: ${Math.round((passed / (passed + failed)) * 100)}%`);

if (failed === 0) {
  console.log(
    "\n🎉 All tests passed! The Enigma machine is working correctly."
  );
} else {
  console.log(
    `\n❌ ${failed} test(s) failed. Please check the implementation.`
  );
}
