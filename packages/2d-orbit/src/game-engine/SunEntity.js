import * as d3 from 'd3';
import { Vector, BaseEntity } from "2d-engine";
import PlanetEntity from "./PlanetEntity";

const SCALE = d3.scaleLog();
SCALE.domain([1, 10000000]);

export default class SunEntity extends PlanetEntity {
  constructor(options) {
    super(options);

    this.isSun = true;
  }

  calculate(delta) {
    var other;
    var magnitudeSq;

    for (var i = 0; i < this.entities.length; i++) {
      if (this.entities[i] !== this && !this.entities[i].dying && !this.entities[i].dead) {
        other = this.entities[i];
        this.tempVector = other.pos.minus(this.pos);
        magnitudeSq = this.tempVector.magnitudeSq();

        if (magnitudeSq > 500000000) {
          other.dead = true;
          this.engine.flung++;
        }

        else if (Math.sqrt(magnitudeSq) <= this.radius + other.radius) {
          other.dead = true;
          other.dyingFade = 1;
        }
      }
    }
  }

  update(delta) {
    this.deltaScaled = delta / 1000;

    this.heading.x += this.forceVector.x / this.mass * delta;
    this.heading.y += this.forceVector.y / this.mass * delta;
    this.heading.timesEquals(Math.min(5 * delta / 100, 1));
    this.pos.scalePlusEquals(delta, this.heading);

    this.element.translation.set(
      this.xScale(this.pos.x),
      this.yScale(this.pos.y)
    );

    this.element.rotation = this.element.rotation + (this.rotationSpeed / delta);
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

    this.element.fill = "#ffff00";
  }

  destroy() {
    this.canvas.remove(this.element);
  }
}
