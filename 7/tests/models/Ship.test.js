import { Ship } from "../../src/models/Ship.js";

describe("Ship", () => {
  let ship;

  beforeEach(() => {
    ship = new Ship(3);
  });

  describe("constructor", () => {
    test("should create a ship with default length 3", () => {
      const defaultShip = new Ship();
      expect(defaultShip.length).toBe(3);
      expect(defaultShip.locations).toEqual([]);
      expect(defaultShip.hits).toEqual([false, false, false]);
    });

    test("should create a ship with specified length", () => {
      const customShip = new Ship(5);
      expect(customShip.length).toBe(5);
      expect(customShip.hits).toEqual([false, false, false, false, false]);
    });
  });

  describe("setLocations", () => {
    test("should set locations successfully", () => {
      const locations = ["00", "01", "02"];
      ship.setLocations(locations);
      expect(ship.locations).toEqual(locations);
    });

    test("should throw error if locations length does not match ship length", () => {
      const locations = ["00", "01"];
      expect(() => ship.setLocations(locations)).toThrow(
        "Ship requires exactly 3 locations"
      );
    });

    test("should create a copy of locations array", () => {
      const locations = ["00", "01", "02"];
      ship.setLocations(locations);
      locations.push("03");
      expect(ship.locations).toEqual(["00", "01", "02"]);
    });
  });

  describe("hit", () => {
    beforeEach(() => {
      ship.setLocations(["00", "01", "02"]);
    });

    test("should record hit at valid location", () => {
      const result = ship.hit("01");
      expect(result).toBe(true);
      expect(ship.hits[1]).toBe(true);
    });

    test("should return false for invalid location", () => {
      const result = ship.hit("99");
      expect(result).toBe(false);
      expect(ship.hits).toEqual([false, false, false]);
    });

    test("should handle multiple hits", () => {
      ship.hit("00");
      ship.hit("02");
      expect(ship.hits).toEqual([true, false, true]);
    });
  });

  describe("isSunk", () => {
    beforeEach(() => {
      ship.setLocations(["00", "01", "02"]);
    });

    test("should return false when no hits", () => {
      expect(ship.isSunk()).toBe(false);
    });

    test("should return false when partially hit", () => {
      ship.hit("00");
      ship.hit("01");
      expect(ship.isSunk()).toBe(false);
    });

    test("should return true when all locations are hit", () => {
      ship.hit("00");
      ship.hit("01");
      ship.hit("02");
      expect(ship.isSunk()).toBe(true);
    });
  });

  describe("isHitAt", () => {
    beforeEach(() => {
      ship.setLocations(["00", "01", "02"]);
    });

    test("should return false for unhit location", () => {
      expect(ship.isHitAt("00")).toBe(false);
    });

    test("should return true for hit location", () => {
      ship.hit("01");
      expect(ship.isHitAt("01")).toBe(true);
    });

    test("should return false for invalid location", () => {
      expect(ship.isHitAt("99")).toBe(false);
    });
  });

  describe("getUnhitLocations", () => {
    beforeEach(() => {
      ship.setLocations(["00", "01", "02"]);
    });

    test("should return all locations when no hits", () => {
      expect(ship.getUnhitLocations()).toEqual(["00", "01", "02"]);
    });

    test("should return only unhit locations", () => {
      ship.hit("00");
      ship.hit("02");
      expect(ship.getUnhitLocations()).toEqual(["01"]);
    });

    test("should return empty array when all locations are hit", () => {
      ship.hit("00");
      ship.hit("01");
      ship.hit("02");
      expect(ship.getUnhitLocations()).toEqual([]);
    });
  });
});
