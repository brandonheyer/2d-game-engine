import * as d3 from 'd3';
import {Point, Vector, BaseEntity} from '2d-engine';

const GEE = .00000013

const SCALE = d3.scaleLog();
SCALE.domain([1, 1024000]);

export default class PlanetEntity extends BaseEntity {
  constructor(options) {
    super(options);

    options = options || {};

    this.heading = new Vector(
      options.headingX || 0,
      options.headingY || 0
    );

    this.mass = options.mass;
    this.density = options.density || .01;
    this.radius = Math.sqrt(this.mass / (this.density * Math.PI));
    this.tempVector = new Vector(0,0);
    this.forceVector = new Vector(0,0);
  }

  calculate(delta) {
    var other;
    var magnitude;
    var force;
    var angle;

    this.forceVector.x = 0;
    this.forceVector.y = 0;

    if (this.dying) {
      return;
    }

    for (var i = 0; i < this.entities.length; i++) {
      if (!this.dying && !this.dead && this.entities[i] !== this) {
        if (!this.entities[i].dying && !this.entities[i].dead) {
          let magnitudeSq;

          other = this.entities[i];
          this.tempVector = other.pos.minus(this.pos);
          magnitudeSq = this.tempVector.magnitudeSq();

          if (this.isSun && magnitudeSq > 35000000) {
            other.dead = true;
            this.engine.flung++;
          } else if (magnitudeSq >= (this.radius * this.radius) + (other.radius * other.radius) && magnitudeSq < 10000000) { //magnitudeSq < 100000000 && magnitudeSq >
            force = GEE * this.mass * other.mass / magnitudeSq;

            angle = this.tempVector.angle();
            this.forceVector.x += Math.cos(angle) * force;
            this.forceVector.y += Math.sin(angle) * force;
          } else if (magnitudeSq < 10000000) { // if (magnitudeSq < 100000000) {

            let that = this;

            if (that.mass < other.mass) {
              that = other;
              other = this;
            }

            // let magnitude = Math.sqrt(magnitudeSq);
            // let pushDistance = this.tempVector.times((this.radius + other.radius - magnitude) / magnitude);
            //
            // this.tempVector = (this.heading.minus(other.heading));
            // pushDistance.normalize();
            //
            // let dot = this.tempVector.dot(pushDistance);
            //
            // if (dot < 0) {
            //   this.heading.scalePlusEquals(dot, pushDistance);
            // }

            this.tempVector.normalize();
            let a1 = other.heading.dot(this.tempVector);
            let a2 = this.heading.dot(this.tempVector);
            let o2 = (2 * (a1 - a2)) / 2;

            this.forceVector.x += (o2 * this.tempVector.x);
            this.forceVector.y += (o2 * this.tempVector.y);


            //
            // let m1 = that.mass / (that.mass + other.mass);
            // let m2 = other.mass / (that.mass + other.mass);
            //
            // that.forceVector.x += (that.heading.x * m1) + (other.heading.x * m2);
            // that.forceVector.y += (that.heading.y * m1) + (other.heading.y * m2);

            that.density = ((this.mass * this.density) + (other.mass * other.density)) / (this.mass + other.mass);
            that.mass += other.mass;
            this.renderDensity();

            other.dying = true;
            other.dyingFade = 1;
          }
        }
      }
    }
  }

  renderDensity() {
    this.element.fill = d3.interpolateViridis(SCALE(this.density));
    this.radius = Math.sqrt(this.mass / (this.density * Math.PI));
    this.element.radius = this.xScale(this.radius);
  }

  update(delta) {
    if (this.dead) {
      this.engine.removeEntity(this);
    } else if (this.dying) {
      this.dyingFade -= delta / 1000;

      if (this.dyingFade <= 0) {
        this.engine.removeEntity(this);
      } else {
        this.element.fill = 'rgba(100, 15, 0, ' + this.dyingFade + ')';
        this.element.radius += delta / 500;
      }
    } else {
        if (this.density < 1024000 / 4 && this.mass / this.density > 2500) {
          this.density += this.density * .002 / (delta / 1000);
          this.renderDensity();
        } else if (this.mass / this.density > 10000) {
          this.density += this.density * .001 / (delta / 1000);
          this.renderDensity();
        } else if (this.mass / this.density < 100) {
          this.density -= this.density * .0025 / (delta / 1000);
          this.renderDensity();
        }

      this.heading.x += this.forceVector.x / this.mass * delta;
      this.heading.y += this.forceVector.y / this.mass * delta;

      this.pos.scalePlusEquals(delta, this.heading);
      this.element.translation.set(this.xScale(this.pos.x), this.yScale(this.pos.y));
    }
  }

  render(canvas) {
    this.canvas = canvas;

    this.element = canvas.makeCircle(
      this.xScale(this.pos.x),
      this.yScale(this.pos.y),
      this.xScale(this.radius)
    );

    this.element.fill = d3.interpolateViridis(SCALE(this.density));
    this.element.noStroke();
  }

  destroy() {
    this.canvas.remove(this.element);
  }
}
