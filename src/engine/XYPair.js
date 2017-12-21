const TOLERANCE = 0.0001;

/**
 * A basic xy pair
 */
class XYPair {
  constructor(x, y) {
    this.set(x, y);
  }

  /**
   * Compare to another XYPair for equivalene within the
   * provided tolerance
   *
   * @param  {XYPair} pair      - the XYPair to compare to
   * @param  {[type]} tolerance - the tolerance to check within, optional
   *                              will default to TOLERANCE
   *
   * @return {boolean}           - whether or not the two points are equal
   */
  equals(pair, tolerance) {
    var dx = Math.abs(this.x - pair.x);
    var dy = Math.abs(this.y - pair.y);

    tolerance = tolerance || TOLERANCE;

    return dx < tolerance && dy < tolerance;
  }

  /**
   * Set with either an x and y value or an existing XYPair
   *
   * @param {number|XYPair} x - the x value, or the XYPair to copy
   * @param {number} y        - the y value, optional if using an XYPair for x value
   */
  set(x, y) {
    if (x.x) {
      this.x = x.x;
      this.y = x.y;
    } else {
      this.x = x;
      this.y = y;
    }
  }
}

export default XYPair;
