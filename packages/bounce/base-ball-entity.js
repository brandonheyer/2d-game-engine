import {
  Point,
  Vector,
  BaseEntity,
  random,
  seedrandom
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
let i = 0;

export default class BallEntity extends BaseEntity {
  constructor(options) {
    super(options);

    this.heading = new Vector(0, 0);
  }

  initializeProperties(options) {
    this.dead = false;
    this.engine = options.engine;
    this.radius = rngRadius();
    this.mass = this.radius;

    super.initializeProperties(options);
  }

  startingPosition() {
    return new Point(
      this.engine.randomXPos(),
      this.engine.randomYPos()
    );
  }

  updateWithOther(delta, other) {
    tempVector.x = this.pos.x - other.pos.x;
    tempVector.y = this.pos.y - other.pos.y;

    magnitudeSq = tempVector.magnitudeSq();
    minDistance = this.radius + other.radius;
    minDistanceSq = minDistance * minDistance;

    if (magnitudeSq < minDistanceSq) {
      magnitude = Math.sqrt(magnitudeSq);

      normalizedVector.x = tempVector.x / magnitude;
      normalizedVector.y = tempVector.y / magnitude;

      this.onCollision(other, normalizedVector, magnitude);
    }
  }

  update(delta) {
    for (i = 0; i < this.entities.length; i++) {
      if (this.index !== i) {
        this.updateWithOther(delta, this.entities[i]);
      }
    }

    this.preUpdatePosition(delta);
    this.updatePosition(delta);
    this.postUpdatePosition();

    this.element.translation.set(
      this.xScale(this.pos.x),
      this.yScale(this.pos.y)
    );
  }

  preUpdatePosition(delta) {}

  updatePosition(delta) {
    this.pos.plusEquals(this.heading);
  }

  postUpdatePosition() {}

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
