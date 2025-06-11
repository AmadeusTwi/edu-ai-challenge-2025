/**
 * Represents a ship in the Sea Battle game
 */
export class Ship {
  constructor(length = 3) {
    this.length = length;
    this.locations = [];
    this.hits = new Array(length).fill(false);
  }

  /**
   * Sets the locations for this ship
   * @param {Array<string>} locations - Array of location strings (e.g., ['00', '01', '02'])
   */
  setLocations(locations) {
    if (locations.length !== this.length) {
      throw new Error(`Ship requires exactly ${this.length} locations`);
    }
    this.locations = [...locations];
  }

  /**
   * Records a hit at the specified location
   * @param {string} location - The location that was hit
   * @returns {boolean} - True if the hit was successful, false if location is invalid
   */
  hit(location) {
    const index = this.locations.indexOf(location);
    if (index === -1) return false;
    this.hits[index] = true;
    return true;
  }

  /**
   * Checks if the ship is completely sunk
   * @returns {boolean} - True if all parts of the ship are hit
   */
  isSunk() {
    return this.hits.every((hit) => hit);
  }

  /**
   * Checks if a specific location has been hit
   * @param {string} location - The location to check
   * @returns {boolean} - True if the location has been hit
   */
  isHitAt(location) {
    const index = this.locations.indexOf(location);
    return index !== -1 && this.hits[index];
  }

  /**
   * Gets the remaining unhit locations
   * @returns {Array<string>} - Array of unhit locations
   */
  getUnhitLocations() {
    return this.locations.filter((location, index) => !this.hits[index]);
  }
}
