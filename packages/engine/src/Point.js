import XYPair from './XYPair';
import Vector from './Vector';

class Point extends XYPair {
  minus(rhs) {
    return new Vector(this.x - rhs.x, this.y - rhs.y);
  }

  plus(rhs) {
    return new Point(this.x + rhs.x, this.y + rhs.y);
  }

  plusEquals(rhs) {
    this.set(this.x + rhs.x, this.y + rhs.y);
  }

  scalePlus(scalar, vector) {
    return new Point(
      this.x + (vector.x * scalar),
      this.y + (vector.y * scalar)
    );
  }

  scalePlusEquals(scalar, vector) {
    this.set(
      this.x + (vector.x * scalar),
      this.y + (vector.y * scalar)
    );
  }
}

Point.ZERO_POINT = new Point(0, 0);

export default Point;
