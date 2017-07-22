const TOLERANCE = 0.0001;

class XYPair {
  constructor(x, y) {
    this.set(x, y);
  }

  equals(pair, tolerance) {
    var dx = Math.abs(this.x - pair.x);
    var dy = Math.abs(this.y - pair.y);

    tolerance = tolerance || TOLERANCE;

    return dx < tolerance && dy < tolerance;
  }

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
