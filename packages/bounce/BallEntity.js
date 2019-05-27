import {
  Point,
  Vector,
  BaseEntity
} from "2d-engine";

const BOUNCE_ABSORPTION_BALL = .98;
const BOUNCE_ABSORPTION_WALL = .68;
const BALL_RADIUS_MIN = 10;
const BALL_RADIUS_MAX = 150;
const GRAVITY = 9.8;

export default class BallEntity extends BaseEntity {
  constructor(options) {
    super(options);

    this.heading = new Vector(
      0,
      0
    );

    this.radius = Math.random() * (Math.max(BALL_RADIUS_MAX - BALL_RADIUS_MIN, 1)) + BALL_RADIUS_MIN;
  }

  startingPosition() {
    console.log(this.xMax, this.yMax);
    return new Point(
      Math.floor(Math.random() * this.xMax),
      Math.floor(Math.random() * this.yMax)
    );
  }

  update(delta) {
    var other;
    var tempVector;
    var magnitude;
    var pushDistance;
    var newX;
    var newY;

    for (var i = 0; i < this.entities.length; i++) {
      other = this.entities[i];

      tempVector = this.pos.minus(other.pos);
      magnitude = tempVector.magnitude();

      if (other !== this && magnitude < (this.radius + other.radius)) {
        pushDistance = tempVector.times((this.radius + other.radius - magnitude) / magnitude);

        this.pos.plusEquals(pushDistance);
        other.pos.x -= pushDistance.x;
        other.pos.y -= pushDistance.y;

        tempVector = (this.heading.minus(other.heading));
        pushDistance.normalize();
        var dot = tempVector.dot(pushDistance);

        if (dot < 0) {
          this.heading.scalePlusEquals(-1 * BOUNCE_ABSORPTION_BALL * dot, pushDistance);
          other.heading.scalePlusEquals(BOUNCE_ABSORPTION_BALL * dot, pushDistance);
        }
      }
    }

    this.heading.y = this.heading.y + (GRAVITY / delta);
    this.pos.plusEquals(this.heading);

    newX = this.pos.x;
    newY = this.pos.y;

    if (this.pos.x > this.xMax - this.radius) {
      this.pos.x = (this.xMax - this.radius) - (this.pos.x - (this.xMax - this.radius));
      this.heading.x *= -1 * BOUNCE_ABSORPTION_WALL;
    } else if (this.pos.x < this.radius) {
      this.pos.x = ((this.radius) - (this.pos.x - this.radius));
      this.heading.x *= -1 * BOUNCE_ABSORPTION_WALL;
    }

    if (this.pos.y > this.yMax - this.radius) {
      this.pos.y = (this.yMax - this.radius) - (this.pos.y - (this.yMax - this.radius));
      this.heading.y *= -1 * BOUNCE_ABSORPTION_WALL;
    } else if (this.pos.y < this.radius) {
      this.pos.y = ((this.radius) - (this.pos.y - this.radius));
      this.heading.y *= -1 * BOUNCE_ABSORPTION_WALL;
    }

    console.log("update", this.pos, newX, newY);
    this.element.translation.set(this.xScale(this.pos.x), this.yScale(this.pos.y));
  }

  render(canvas) {
    this.element = canvas.makeCircle(
      this.xScale(this.pos.x),
      this.yScale(this.pos.y),
      this.xScale(this.radius)
    );

    this.element.fill = '#000000';
  }
}
