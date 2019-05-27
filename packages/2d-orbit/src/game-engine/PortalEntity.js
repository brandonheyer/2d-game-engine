import * as d3 from 'd3';
import { Vector, BaseEntity } from "2d-engine";

export default class PortalEntity extends BaseEntity {
  constructor(options) {
    super(options);

    options = options || {};

    this.heading = new Vector(0, 0);
    this.size = options.size || 100;
    this.rotation = options.rotation || 0;
    this.sister = options.sister;

    this.engine = options.engine;
    this.entities = this.engine.entities;

    this.tempVector = new Vector(0,0);
    this.warps = [];
  }

  calculate(delta) {
    var other;
    var magnitude;

    this.warps = [];

    for (var i = 0; i < this.entities.length; i++) {
      other = this.entities[i];
      if (other.isPlanet && !other.isDying && !other.isDead) {
        this.tempVector = other.pos.minus(this.pos);
        magnitude = this.tempVector.magnitude();

        if (magnitude < other.radius) {
          this.warps.push(other);
        }
      }
    }
  }

  update(delta) {
    var other;
    var magnitude;

    this.deltaScaled = delta / 1000;

    for (var i = 0; i < this.warps.length; i++) {
      other = this.warps[i];
      this.tempVector.x = Math.cos(this.rotation);
      this.tempVector.y = Math.sin(this.rotation);
      this.tempVector.negate();
      const dot = other.heading.getNormalized().dot(this.tempVector);

      console.log(dot);
      if (other.isPlanet && !other.isDying && !other.isDead && dot > 0) {
        const angleToPortal = other.pos.minus(this.pos).angle();
        let rotDiff = (this.sister.rotation - this.rotation) + Math.PI;
        other.heading.rotate(rotDiff - angleToPortal + Math.acos(dot));
        // other.heading.rotate(Math.acos(dot));
        console.log(rotDiff * 180 / Math.PI, angleToPortal * 180 / Math.PI, Math.acos(dot) * 180 / Math.PI);
        other.pos.set(this.sister.pos);
        this.tempVector = other.heading.getNormalized();
        other.pos.scalePlusEquals(other.radius * 2, this.tempVector);
      }
    }

    this.element.translation.set(
      this.xScale(this.pos.x),
      this.yScale(this.pos.y)
    );
  }

  render(canvas) {
    if (canvas) {
      this.canvas = canvas;
    }

    if (this.element) {
      this.element.vertices.forEach((v,i) => {
        v.set(
          this.scale(v._origX),
          this.scale(v._origY)
        );
      });
    } else {
      this.points = [
        0, 0,
        this.size / 16, this.size / 2,
        0, this.size
      ];

      this.scaledPoints = this.points.map((v) => this.scale(v));

      this.element = canvas.makePath.apply(canvas, this.scaledPoints);
      this.element.vertices.forEach((v, i) =>  {
        v._origX = this.points[i * 2];
        v._origY = this.points[(i * 2) + 1];
      });

      this.element.translation.set(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y)
      );

      this.element.rotation = this.rotation;

      this.element.curved = true;
      this.element.noStroke();
    }

    this.element.fill = "#ff0000";
  }

  destroy() {
    this.canvas.remove(this.element);
  }
}
