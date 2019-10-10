import XYPair from './XYPair';

const TOLERANCE = 0.0001;
const TOLERANCE_SQ = TOLERANCE * TOLERANCE;

class Vector extends XYPair {
  angle() {
    // if (this.magnitudeSq() < TOLERANCE_SQ) {
    //   return 0;
    // }

    return Math.atan2(this.y, this.x);
  }

  divide(divisor) {
    if (divisor === 0) {
      throw new Error('Division by zero');
    }

    return new Vector(this.x / divisor, this.y / divisor);
  }

  divideEquals(divisor, yDivisor) {
    if (divisor === 0) {
      throw new Error('Division by zero');
    }

    yDivisor = yDivisor || divisor;

    this.set(
      this.x / divisor,
      this.y / yDivisor
    );
  }

  dot(rhs) {
    return (this.x * rhs.x) + (this.y * rhs.y);
  }

  getLeftOrtho() {
    return new Vector(-1 * this.y, this.x);
  }

  getRightOrtho() {
    return new Vector(this.y, -1 * this.x);
  }

  getNormalized() {
    if (this.magnitudeSq() < TOLERANCE_SQ) {
      return this;
    }

    return new Vector(
      this.x / this.magnitude(),
      this.y / this.magnitude()
    );
  }

  magnitude() {
    return Math.sqrt(this.magnitudeSq());
  }

  magnitudeSq() {
    return (this.x * this.x) + (this.y * this.y);
  }

  minus(rhs) {
    return new Vector(this.x - rhs.x, this.y - rhs.y);
  }

  minusEquals(rhs) {
    this.set(
      this.x - rhs.x,
      this.y - rhs.y
    );
  }

  negate() {
    this.set(
      this.x * -1,
      this.y * -1
    );
  }

  plus(rhs) {
    return new Vector(this.x + rhs.x, this.y + rhs.y);
  }

  plusEquals(rhs) {
    this.x += rhs.x;
    this.y += rhs.y;
  }

  scalePlus(scalar, vector) {
    return new Vector(
      this.x + (vector.x * scalar),
      this.y + (vector.y * scalar)
    );
  }

  scalePlusEquals(scalar, scalarY, vector) {
    if (!vector) {
      vector = scalarY;
      scalarY = scalar;
    }

    this.x += vector.x * scalar;
    this.y += vector.y * scalarY;
  }


  setLeftOrtho() {
    this.set(
      -1 * this.y,
      this.x
    );
  }

  setRightOrtho() {
    this.set(
      this.y,
      -1 * this.x
    );
  }

  times(mult) {
    return new Vector(
      this.x * mult,
      this.y * mult
    );
  }

  timesEquals(mult) {
    this.x *= mult;
    this.y *= mult;
  }

  truncate(distance) {
    if (this.magnitudeSq() > distance * distance) {
      this.normalize();
      this.timesEquals(distance);
    }

    return this;
  }

  createFromPoints(p1, p2) {
    this.set(
      p1.x - p2.x,
      p1.y - p2.y
    );
  }

  rotate(angle) {
    var cosAngle = Math.cos(angle);
    var sinAngle = Math.sin(angle);

    this.set(
      (this.x * cosAngle) - (this.y * sinAngle),
      (this.y * cosAngle) - (this.x * sinAngle)
    );
  }

  normalize() {
    if (this.magnitudeSq() < TOLERANCE_SQ || this.equals(Vector.ZERO_VECTOR)) {
      return;
    }

    var magnitude = this.magnitude();

    this.x /= magnitude;
    this.y /= magnitude;
  }

  reflectX() {
    this.x *= -1;
  }

  reflectY() {
    this.y *= -1;
  }
}

Vector.ZERO_VECTOR = new Vector(0, 0);

export default Vector;
