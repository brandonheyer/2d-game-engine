import {
  Point,
  Vector,
  BaseEntity,
  random,
  seedrandom,
  separation,
  bounce,
  boundaryReflect,
  gravity
} from "2d-engine";

const BALL_RADIUS_MIN = 2;
const BALL_RADIUS_MAX = 20;
const BALL_RADIUS_RANGE = BALL_RADIUS_MAX - BALL_RADIUS_MIN;

const rng = random.clone(seedrandom("ball-entity"));
const rngRadius = rng.uniformInt(BALL_RADIUS_MIN, Math.max(BALL_RADIUS_RANGE, 1));

let normalizedVector = new Vector(0, 0);
let tempVector = new Vector(0, 0);
let magnitudeSq = 0;
let magnitude = 0;
let minDistanceSq = 0;
let minDistance = 0;
let dot = 0;
let pushDistance = new Vector(0, 0);
let other;
let pushScalar = 0;
let i = 0;
let posPartdiff = 0;
let myIndex = 0;

export default class BallEntity extends BaseEntity {
  constructor(options) {
    super(options);

    this.heading = new Vector(0, 0);
  }

  initializeProperties(options) {
    this.engine = options.engine;
    this.radius = rngRadius();
    this.mass = this.radius;
    this.mags = [];
    this.mags.length = 100;
    this.magI = 0;

    super.initializeProperties(options);
  }

  startingPosition() {
    return new Point(
      this.engine.randomXPos(),
      this.engine.randomYPos()
    );
  }

  handleOther(delta) {
    other = this.entities[i];

    // if (!this.dead && this.index !== i) {
    if (this.index !== i) {
      // 260.6
      tempVector.x = this.pos.x - other.pos.x;
      tempVector.y = this.pos.y - other.pos.y;

      magnitudeSq = tempVector.magnitudeSq();
      minDistance = this.radius + other.radius;
      minDistanceSq = minDistance * minDistance;

      if (magnitudeSq < minDistanceSq) {
        magnitude = Math.sqrt(magnitudeSq);

        normalizedVector.x = tempVector.x / magnitude;
        normalizedVector.y = tempVector.y / magnitude;

        separation(this, other, normalizedVector, magnitude);
        bounce(this, other, normalizedVector);
      }
    }
  }

  update(delta) {
    for (i = 0; i < this.entities.length; i++) {
      this.handleOther(delta);
    }

    this.updatePosition(delta);
  }

  translate() {
    if (!this.dead) {
      if (
        Math.abs(this.xScale(this.pos.x) - this.element.translation.x) +
        Math.abs(this.yScale(this.pos.y) - this.element.translation.y) < 1
      ) {
        this.magI++;
      }
      else if (this.magI > 0){
        this.magI--;
      }

      if (this.magI > 100) {
        this.dead = true;
      }
    }

    this.element.translation.set(
      this.xScale(this.pos.x),
      this.yScale(this.pos.y)
    );
  }

  updatePosition(delta) {
    gravity(this, delta);

    this.pos.plusEquals(this.heading);

    boundaryReflect(this);

    this.translate();
  }

  render(canvas) {
    this.element = canvas.makeCircle(
      this.xScale(this.pos.x),
      this.yScale(this.pos.y),
      this.xScale(this.radius)
    );

    this.element.fill = "#8C8880";
    this.element.stroke = "none";
  }
}

let dead = 0;
