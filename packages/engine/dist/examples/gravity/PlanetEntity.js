import * as d3 from 'd3';
import {Point, Vector, BaseEntity} from '2d-engine';

const GEE = .000013

const SCALE = d3.scaleLog();
SCALE.domain([1, 10000000]);

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
    this.radius = Math.sqrt(this.mass / (this.density * Math.PI)) * 10;
    this.tempVector = new Vector(0,0);
    this.forceVector = new Vector(0,0);
    this.deltaScaled = 0;
  }

  calculate(delta) {
    var other;
    var magnitude;
    var force;
    var angle;
    var magnitudeSq;

    this.forceVector.x = 0;
    this.forceVector.y = 0;

    if (this.dying) {
      return;
    }

    for (var i = 0; i < this.entities.length; i++) {
      if (!this.dying && !this.dead && this.entities[i] !== this) {
        if (!this.entities[i].dying && !this.entities[i].dead) {
          other = this.entities[i];
          this.tempVector = other.pos.minus(this.pos);
          magnitudeSq = this.tempVector.magnitudeSq();
          magnitude = Math.sqrt(magnitudeSq);

          if (this.isSun && magnitude > 50000) {
            other.dead = true;
            this.engine.flung++;
          } else if (magnitude >= this.radius + other.radius) { // && magnitudeSq < 10000000 * (this.isSun ? 10000 : 1))) { //magnitudeSq < 100000000 && magnitudeSq >
            force = GEE * this.mass * other.mass / magnitudeSq;

            angle = this.tempVector.angle();
            this.forceVector.x += Math.cos(angle) * force;
            this.forceVector.y += Math.sin(angle) * force;
          } else {

            let that = this;

            if (that.mass < other.mass) {
              that = other;
              other = this;
            }

            this.tempVector.normalize();

            let a1 = other.heading.dot(this.tempVector);
            let a2 = this.heading.dot(this.tempVector);
            let o2 = (2 * (a1 - a2)) / 2;

            this.forceVector.x += (o2 * this.tempVector.x);
            this.forceVector.y += (o2 * this.tempVector.y);

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
    this.radius = Math.sqrt(this.mass / (this.density * Math.PI)) * 10;
    this.element.radius = this.scale(this.radius);
  }

  update(delta) {
    this.deltaScaled = delta / 1000;

    if (this.dead) {
      this.engine.removeEntity(this);
    } else if (this.dying) {
      this.dyingFade -= this.deltaScaled;

      if (this.dyingFade <= 0) {
        this.engine.removeEntity(this);
      } else {
        this.element.fill = 'rgba(100, 15, 0, ' + this.dyingFade + ')';
        this.element.radius += this.deltaScaled * 2;
      }
    } else {
        if (this.density < 10000000 / 4 && this.mass / this.density > 250) {
          this.density += this.density * .001 / this.deltaScaled;
          this.renderDensity();
        } else if (this.mass / this.density > 1000) {
          this.density += this.density * .0005 / this.deltaScaled;
          this.renderDensity();
        } else if (this.mass / this.density < 50) {
          this.density -= this.density * .00125 / this.deltaScaled;
          this.renderDensity();
        }

      this.renderDensity();

      this.heading.x += this.forceVector.x / this.mass * delta;
      this.heading.y += this.forceVector.y / this.mass * delta;

      this.pos.scalePlusEquals(delta, this.heading);
      this.element.translation.set(this.xScale(this.pos.x), this.yScale(this.pos.y));
    }
  }

  render(canvas) {
    if (canvas) {
      this.canvas = canvas;
    }

    if (this.element) {
      this.element.radius = this.scale(this.radius);
    } else {
      this.element = canvas.makeCircle(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y),
        this.scale(this.radius)
      );
    }

    this.element.fill = d3.interpolateViridis(SCALE(this.density));
    this.element.noStroke();
  }

  destroy() {
    this.canvas.remove(this.element);
  }
}
