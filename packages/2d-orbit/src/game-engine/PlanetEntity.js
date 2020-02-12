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

    this.pathString = "";

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
                other.heading.x = ((this.heading.x * m1) + (other.heading.x * m2)) / (m1 + m2);
                other.heading.y = ((this.heading.y * m1) + (other.heading.y * m2)) / (m1 + m2);

                this.mass += other.mass / 3;
                this.renderDensity();

                other.dying = true;
                other.dyingFade = 1;
                // this.dying = true;
                return;
              }
            } else if (other.isSun && magnitudeSq > 500000000) {
              this.dead = true;
              return;
            } else if (other.isSun || magnitudeSq < 50000000000) {
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
    // this.element.scale = this.radius / this.baseRadius;
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
    }
  }

  disableReporting() {
    if (this._update) {
      this.update = this._update;
      this._update = undefined;

      this.engine.emit('planet:reporting', undefined);
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


      this.headingElement && this.headingElement.remove();
      this.forceElement && this.forceElement.remove();
      this.pathElement && this.pathElement.remove();
    } else if (this.dying) {
      this.headingElement && this.headingElement.remove();
      this.forceElement && this.forceElement.remove();
      this.pathElement && this.pathElement.remove();

      this.dead = true;

      if (this.mass > 10000000) {
        let newVec = new Vector(this.heading);
        let newPos = new Point(this.pos);
        newVec.setLeftOrtho();
        newVec.normalize();
        newVec.timesEquals(this.radius);
        newPos.plusEquals(newVec);

        let entity = new PlanetEntity({
          mass: this.mass / 3,
          density: this.density,
          startingPosition: new Point(newPos),
          radius: this.radius / 3,
          headingX: ((-1 * this.heading.y) + (this.heading.x * 3)) / 4,
          headingY: (this.heading.x + (this.heading.y * 3)) / 4,
          engine: this.engine
        });

        entity.entities = this.entities;
        entity.engine = this;

        this.engine.addEntity(entity);

        newVec = new Vector(this.heading);
        newPos = new Point(this.pos);
        newVec.setRightOrtho();
        newVec.normalize();
        newVec.timesEquals(this.radius);
        newPos.plusEquals(newVec);

        entity = new PlanetEntity({
          mass: this.mass / 3,
          density: this.density,
          startingPosition: new Point(newPos),
          radius: this.radius / 3,
          headingX: ((this.heading.x * 3) + this.heading.y) / 4,
          headingY: ((-1 * this.heading.x) + (this.heading.y * 3)) / 4,
          engine: this.engine
        });

        entity.entities = this.entities;
        entity.engine = this;

        this.engine.addEntity(entity);
      }

      // if (this.dyingFade === 1) {
      //   this.headingElement.remove();
      //   this.forceElement.remove();
      //   this.pathElement.remove();

      // this.dyingFade -= this.deltaScaled;
      //
      // if (this.dyingFade <= 0) {
      //   this.engine.removeEntity(this);
      // } else {
      //   this.planetElement.fill = 'rgba(100, 15, 0, ' + this.dyingFade + ')';
      //   this.element.scale += this.deltaScaled * 2;
      // }
    } else {
      // if (this.density < 10000000 / 4 && this.mass / this.density > 250) {
      //   this.density += this.density * .001 / this.deltaScaled;
      // } else if (this.mass / this.density > 1000) {
      //   this.density += this.density * .0005 / this.deltaScaled;
      // } else if (this.mass / this.density < 50) {
      //   this.density -= this.density * .00125 / this.deltaScaled;
      // }

      this.renderDensity();

      this.heading.x += this.forceVector.x / this.mass * delta;
      this.heading.y += this.forceVector.y / this.mass * delta;

      const endHeading = this.heading.getNormalized();
      const endForce = this.forceVector.getNormalized();

      this.translateByPoint(this.pos);
      this.translateByPoint(this.pos, this.forceElement);

      this.headingElement.vertices[0].set(
        this.xScale(this.pos.x + endHeading.x),
        this.yScale(this.pos.y + endHeading.y)
      );

      this.headingElement.vertices[1].set(
        this.xScale(this.pos.x + endHeading.x * this.radius),
        this.yScale(this.pos.y + endHeading.y * this.radius)
      );

      this.forceElement.vertices[0].set(
        this.xScale(0),
        this.yScale(0)
      );

      this.forceElement.vertices[1].set(
        this.xScale(endForce.x * this.radius),
        this.yScale(endForce.y * this.radius)
      );

      this.pos.scalePlusEquals(delta, this.heading);

      const anchor = new Two.Anchor(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y)
      );

      anchor._origX = this.pos.x - this.startX;
      anchor._origY = this.pos.y - this.startY;
      this.pathElement.vertices.push(anchor);

      const lastAngle = this.startAngle;
      this.startAngle = (this.pos.minus(this.engine.sun.pos).angle() * 180 / Math.PI + 360) % 360;
      this.rotationAmount += Math.abs(this.startAngle - lastAngle);

      if (this.rotationAmount > 1440) {
        this.pathElement.vertices.shift();
      }
      // this.element.rotation = this.element.rotation + (this.rotationSpeed / delta);
    }
  }

  addPath() {
    const v1 = new Two.Anchor(
      this.xScale(this.pos.x),
      this.yScale(this.pos.y)
    );

    v1._origX = this.pos.x;
    v1._origY = this.pos.y;

    this.pathElement = new Two.Path([v1], false);
    this.canvas.add(this.pathElement);

    this.pathElement.fill = "none";
    this.pathElement.stroke = "#aaaacc";
  }

  render(canvas) {
    if (canvas) {
      this.canvas = canvas;
    }

    const endHeading = this.heading.getNormalized();
    const endForce = this.forceVector.getNormalized();

    if (this.element) {
      this.planetElement.vertices.forEach((v,i) => {
        v.set(
          this.xScale(v._origX),
          this.yScale(v._origY)
        );
      });

      this.pathElement.vertices.forEach((v,i) => {
        v.set(
          this.xScale(v._origX),
          this.yScale(v._origY)
        );
      });

      this.headingElement.vertices[0].set(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y),
      );

      this.headingElement.vertices[1].set(
        this.xScale(this.pos.x + endHeading.x * this.radius),
        this.yScale(this.pos.y + endHeading.y * this.radius),
      );

      this.forceElement.vertices[0].set(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y)
      );

      this.forceElement.vertices[1].set(
        this.xScale(this.pos.x + endForce.x * this.radius),
        this.yScale(this.pos.y + endForce.y * this.radius)
      );
    } else {
      const totalPoints = 16;
      const radianPerPoint = (2 * Math.PI) / totalPoints;
      let rotation = 0;

      this.points = [];

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

      this.headingElement = canvas.makeLine(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y),
        this.xScale(this.pos.x + endHeading.x * this.radius),
        this.yScale(this.pos.y + endHeading.y * this.radius)
      );
      this.headingElement.stroke = "#ff0000";

      this.forceElement = canvas.makeLine(
        this.xScale(0),
        this.yScale(0),
        this.xScale(endForce.x * this.radius),
        this.yScale(endForce.y * this.radius)
      );
      this.forceElement.stroke = "#0000ff";

      this.element = this.planetElement;

      this._update = this.update;
      this.update = this.updateAndBind;
    }

    this.headingElement.linewidth = this.scale(20);
    this.forceElement.linewidth = this.scale(20);
    this.planetElement.fill = d3.interpolatePlasma(SCALE(this.density));

    this.addPath();

    this.startX = this.pos.x;
    this.startY = this.pos.y;
    this.startAngle = (this.pos.minus(this.engine.sun.pos).angle() * 180 / Math.PI + 360) % 360;
    this.rotationAmount = 0;

    this.translateByPoint(this.pos);
    this.translateByPoint(this.pos, this.forceElement);
  }

  destroy() {
    this.canvas.remove(this.element);
  }
}
