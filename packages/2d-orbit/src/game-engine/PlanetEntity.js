import * as d3 from 'd3';
import { Point, Vector, BaseEntity } from "2d-engine";

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

    this.isPlanet = true;
    this.engine = options.engine;
    this.entities = this.engine.entities;
    this.mass = options.mass;
    this.density = options.density || .01;
    this.radius = Math.sqrt(this.mass / (this.density * Math.PI)) * 10;
    this.baseRadius = this.radius;
    this.tempVector = new Vector(0,0);
    this.forceVector = new Vector(0,0);
    this.collideVector = new Vector(0,0);
    this.deltaScaled = 0;
    this.rotationSpeed = (Math.random() / 2) + .2;

    this.disableReporting = this.disableReporting.bind(this);
    this.enableReporting = this.enableReporting.bind(this);
  }

  calculate(delta) {
    var other;
    var magnitude;
    var force;
    var angle;
    var magnitudeSq;

    if (this.dying) {
      return;
    }

    this.forceVector.x = 0;
    this.forceVector.y = 0;

    this.collideVector.x = 0;
    this.collideVector.y = 0;

    for (var i = 0; i < this.entities.length; i++) {
      if (this.entities[i].isPlanet) {
        if (!this.dying && !this.dead && this.entities[i] !== this) {
          if (!this.entities[i].dying && !this.entities[i].dead) {
            other = this.entities[i];
            this.tempVector = other.pos.minus(this.pos);

            magnitudeSq = this.tempVector.magnitudeSq();

            if ((magnitudeSq < 50000) && Math.sqrt(magnitudeSq) <= this.radius + other.radius) {
              if (this.mass >= other.mass) {
                const m1 = this.mass;
                const m2 = other.mass;
                const v1 = this.heading.magnitude();
                const v2 = other.heading.magnitude();

                this.heading.x = ((this.heading.x * m1) + (other.heading.x * m2)) / (m1 + m2);
                this.heading.y = ((this.heading.y * m1) + (other.heading.y * m2)) / (m1 + m2);

                this.mass += other.mass;
                this.renderDensity();

                other.dying = true;
                other.dyingFade = 1;
              }
            } else if (other.isSun || magnitudeSq < 50000000) {
              force = this.engine.GEE * this.mass * other.mass / magnitudeSq;

              angle = this.tempVector.angle();
              this.forceVector.x += Math.cos(angle) * force;
              this.forceVector.y += Math.sin(angle) * force;
            }
          }
        }
      }
    }
  }

  renderDensity() {
    this.planetElement.fill = d3.interpolateViridis(SCALE(this.density));
    this.radius = Math.sqrt(this.mass / (this.density * Math.PI)) * 10;
    this.element.scale = this.radius / this.baseRadius;
  }

  enableReporting() {
    for (var i = 0; i < this.entities.length; i++) {
      if (this.entities[i] !== this) {
        this.entities[i].disableReporting();
      }
    }

    if (!this._update) {
      this._update = this.update;
      this.update = this.updateAndReport;

      this.engine.emit('reporting:planet', this);
      console.log("enable");
    }
  }

  disableReporting() {
    if (this._update) {
      this.update = this._update;
      this._update = undefined;

      this.engine.emit('planet:reporting', undefined);
      console.log("disable");
    }
  }

  updateAndReport(delta) {
    this._update(delta);
    this.emit('setting:change:mass', this.mass);
    this.emit('setting:change:radius', this.radius);
    this.emit('setting:change:density', this.density);
    this.emit('setting:change:speed', this.heading.magnitude());
  }

  updateAndBind(delta) {
    if (this.element._renderer.elem) {
      this.element._renderer.elem.addEventListener('click', this.enableReporting);
      this.update = this._update;
      this._update = undefined;
      this.update(delta);
    } else {
      this._update(delta);
    }
  }

  update(delta) {
    this.deltaScaled = delta / 1000;

    if (this.dead) {
      this.disableReporting();
      this.engine.removeEntity(this);
    } else if (this.dying) {
      if (this.dyingFade === 1) {
        this.headingElement.remove();
        this.forceElement.remove();
      }

      this.dyingFade -= this.deltaScaled;

      if (this.dyingFade <= 0) {
        this.engine.removeEntity(this);
      } else {
        this.planetElement.fill = 'rgba(100, 15, 0, ' + this.dyingFade + ')';
        this.element.scale += this.deltaScaled * 2;
      }
    } else {
      if (this.density < 10000000 / 4 && this.mass / this.density > 250) {
        this.density += this.density * .001 / this.deltaScaled;
      } else if (this.mass / this.density > 1000) {
        this.density += this.density * .0005 / this.deltaScaled;
      } else if (this.mass / this.density < 50) {
        this.density -= this.density * .00125 / this.deltaScaled;
      }

      this.renderDensity();

      this.heading.x += this.forceVector.x / this.mass * delta;
      this.heading.y += this.forceVector.y / this.mass * delta;

      const endHeading = this.heading.getNormalized();
      this.headingElement.vertices[1].set(
        this.xScale((endHeading.x) * this.radius),
        this.yScale((endHeading.y) * this.radius)
      );

      const endForce = this.forceVector.getNormalized();
      this.forceElement.vertices[1].set(
        this.xScale(endForce.x * this.radius),
        this.yScale(endForce.y * this.radius)
      )

      this.pos.scalePlusEquals(delta, this.heading);
      this.element.translation.set(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y)
      );

      this.headingElement.translation.set(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y)
      );

      this.forceElement.translation.set(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y)
      );

      // this.element.rotation = this.element.rotation + (this.rotationSpeed / delta);
    }
  }

  render(canvas) {
    if (canvas) {
      this.canvas = canvas;
    }

    if (this.element) {
      this.planetElement.vertices.forEach((v,i) => {
        v.set(
          this.xScale(v._origX),
          this.yScale(v._origY)
        );
      });

      this.headingElement.linewidth = this.scale(20);
      this.forceElement.linewidth = this.scale(20);

      this.element.translation.set(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y)
      );

      this.headingElement.translation.set(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y)
      );

      this.forceElement.translation.set(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y)
      );
    } else {
      this.points = [];
      const totalPoints = 16;
      const radianPerPoint = (2 * Math.PI) / totalPoints;
      let rotation = 0;

      for (let i = 0; i < totalPoints; i++) {
        const distance = this.radius - (Math.random() * this.radius / 4);
        rotation += Math.random() * ((radianPerPoint / 2) - (radianPerPoint / 4)) + (radianPerPoint / 4);

        this.points.push(
          Math.cos(rotation) * distance,
          Math.sin(rotation) * distance
        );

        this.scaledPoints = this.points.map((v) => this.scale(v));

        rotation = (i + 1) * radianPerPoint;
      }

      this.planetElement = canvas.makePath.apply(canvas, this.scaledPoints);
      this.planetElement.vertices.forEach((v, i) =>  {
        v._origX = this.points[i * 2];
        v._origY = this.points[(i * 2) + 1];
      });

      this.planetElement.curved = true;
      this.planetElement.noStroke();

      const endHeading = this.heading.getNormalized();
      this.headingElement = canvas.makeLine(
        this.xScale(0),
        this.yScale(0),
        this.xScale(endHeading.x * this.radius),
        this.yScale(endHeading.y * this.radius)
      );
      this.headingElement.linewidth = this.scale(20);
      this.headingElement.stroke = "#ff0000";

      const endForce = this.forceVector.getNormalized();
      this.forceElement = canvas.makeLine(
        this.xScale(0),
        this.yScale(0),
        this.xScale(endForce.x * this.radius),
        this.yScale(endForce.y * this.radius)
      );
      this.forceElement.linewidth = this.scale(20);
      this.forceElement.stroke = "#0000ff";

      this.element = this.planetElement; //this.canvas.makeGroup(this.planetElement, this.headingElement);

      this.element.translation.set(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y)
      );

      this.headingElement.translation.set(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y)
      );

      this.forceElement.translation.set(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y)
      );

      this._update = this.update;
      this.update = this.updateAndBind;
    }

    this.planetElement.fill = d3.interpolatePlasma(SCALE(this.density));
  }

  destroy() {
    this.canvas.remove(this.element);
  }
}
