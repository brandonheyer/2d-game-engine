import {
  separation,
  bounce,
  boundaryReflect,
  gravity,
  initKillWhenStable,
  killWhenStable,
  BaseEntity,
  random,
  seedrandom
} from "2d-engine";

const BALL_RADIUS_MIN = 2;
const BALL_RADIUS_MAX = 20;
const BALL_RADIUS_RANGE = BALL_RADIUS_MAX - BALL_RADIUS_MIN;

const rng = random.clone(seedrandom("ball-entity"));
const rngRadius = rng.uniformInt(BALL_RADIUS_MIN, Math.max(BALL_RADIUS_RANGE, 1));

export default class BallEntity extends BaseEntity {
  initializeProperties(options) {
    initKillWhenStable(this);

    options.randomStart = true;
    options.update = "advanced";

    super.initializeProperties(options);

    this.ballAbsorbtion = options.ballAbsorbtion || .9;
    this.wallAbsorbtion = options.wallAbsorbtion || .98;
    this.gravity = options.gravity = 9.8;

    this.dead = false;
    this.radius = options.radius || rngRadius();
    this.mass = this.radius;
  }

  onCollision(other, normalizedVector, magnitude) {
    separation(this, other, normalizedVector, magnitude);
    bounce(this, other, normalizedVector, this.ballAbsorbtion);
  }

  preUpdatePosition(delta) {
    super.preUpdatePosition(delta);

    gravity(this, delta, this.gravity);
  }

  updatePosition(delta) {
    this.pos.plusEquals(this.heading);
  }

  postUpdatePosition(delta) {
    boundaryReflect(this, this.wallAbsorbtion);
    killWhenStable(this);

    super.postUpdatePosition(delta);
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
