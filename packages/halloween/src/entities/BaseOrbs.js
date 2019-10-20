import _ from "lodash";
import { BaseEntity, Point } from '2d-engine';

export default class BaseOrbs extends BaseEntity {
  constructor(options) {
    super(options);

    this.pos = options.getOrbStartPositions ? options.getOrbStartPosition() : this.getOrbStartPositions();

    this.lowX = Infinity;
    this.highX = -Infinity;

    this.pos.forEach(p => {
      this.lowX = Math.min(p.x, this.lowX);
      this.highX = Math.max(p.x, this.highX);
    });

    this.fill = [
      "#ffec9e",
      "#ffc89e",
      "#dedede",
      "#00cc00",
      "#cc00cc",
      "#00cccc",
      "#cccc00",
    ];

    this.time = 0;
    this.totalTime = 0;

    this.preUpdateOrbPosition = options.preUpdateOrbPosition ?
      options.preUpdateOrbPosition.bind(this) :
      this.preUpdateOrbPosition;

    this.postUpdateOrbPosition = options.postUpdateOrbPosition ?
      options.postUpdateOrbPosition.bind(this) :
      this.postUpdateOrbPosition;

    this.updateOrbPosition = options.updateOrbPosition ?
      options.updateOrbPosition.bind(this) :
      this.updateOrbPosition;

    this.radius = options.radius || 0.1;
    this.timeReducer = options.timeReducer || 500;
    this.timeReducer2 = options.timeReducer2 || 1000;
    this.overflowScale = 1.05;
    this.moveSlow = options.moveSlow || 500;
    this.engine = options.engine;

    this.connect = options.connect || false;

    this.trace = options.trace || false;
    this.tracerStroke = options.tracerStroke || "#663311";
    this.tracerWidth = options.tracerWidth || 1;
  }

  getDefaultStartPosition() {
    return new Point(0, this.yScale.domain()[1] / 2);
  }

  getOrbStartPositions() {
    return [];
  }

  preUpdateOrbPosition(delta, orbPosition, orbIndex) {}
  postUpdateOrbPosition(delta, orbPosition, orbIndex) {}

  updateConnection(delta, orbPosition, ordIndex) {
    if (this.connect) {
      this.connection.transform = "none";
      this.connection.vertices[ordIndex].x = this.xScale(orbPosition.x);
      this.connection.vertices[ordIndex].y = this.yScale(orbPosition.y);
    }
  }

  updateOrbPosition(delta, orbPosition, orbIndex) {
    orbPosition.x += (delta / this.timeReducer2);
    orbPosition.y = (orbPosition.y + (this.yMax / 2)) % this.yMax;

    if (this.allOutOfBounds) {
      const scaledRadius = this.radius * this.orbs[orbIndex].scale;
      const orbLength = ((this.highX + scaledRadius) * this.overflowScale) - ((this.lowX - scaledRadius) * this.overflowScale)

      orbPosition.x = -this.overflowScale * scaledRadius - (orbPosition.x % ((this.xMax + scaledRadius) * this.overflowScale));
    }

    for (let i = 0; i < this.orbs[orbIndex].children.length - 1; i++) {
      const currOrb = this.orbs[orbIndex].children[i];

      currOrb.scale = .75 + Math.abs(
        Math.sin(
          this.totalTime / 3 * speed * (1 + (i * 0.15))
        )
      ) * (1 + (i * 0.1));
    }

    this.translateByPoint(orbPosition, this.orbs[orbIndex]);
    this.updateConnection(delta, orbPosition, orbIndex);
  }

  update(delta) {
    this.time = (this.time + (delta / this.timeReducer)) % this.xMax;
    this.totalTime += delta / this.timeReducer;

    this.pos.forEach(_.bind(this.preUpdateOrbPosition, this, delta));

    this.allOutOfBounds = this.pos.every(
      (p, i) => p.x > (this.xMax + (this.radius * this.orbs[i].scale)) * this.overflowScale
    );

    this.pos.forEach(_.bind(this.updateOrbPosition, this, delta));
    this.pos.forEach(_.bind(this.postUpdateOrbPosition, this, delta));
  }

  destroy() {
    this.orbs.forEach(o => o.remove());

    this.connect && this.connection.remove();

    this.element.remove();
    this.element = undefined;
  }

  render(canvas) {
    if (!this.element) {
      this.element = canvas.makeGroup();
      this.orbs = [];

      const points = [];

      this.pos.forEach((o, i) => {
        points.push(0);
        points.push(0);

        this.orbs[i] = canvas.makeGroup();

        let tempOrb = canvas.makeCircle(
          this.xScale(0),
          this.yScale(0),
          this.xScale(this.radius)
        );

        tempOrb.fill = this.fill[i];
        tempOrb.noStroke();

        tempOrb.addTo(this.orbs[i]);
      });

      points.push(true);

      if (this.connect) {
        this.connection = canvas.makePath.apply(canvas, points);
        this.connection.fill = "none";
      }

      this.orbs.forEach(o => o.addTo(this.element));
    }

    this.connect && (this.connection.stroke = "#cccccc");
  }
}
