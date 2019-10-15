import _ from "lodash";
import { BaseEntity, Point } from '2d-engine';

export default class BaseOrbs extends BaseEntity {
  constructor(options) {
    super(options);

    this.pos = this.getOrbStartPositions();

    this.lowX = Infinity;
    this.highX = -Infinity;

    this.pos.forEach(p => {
      this.lowX = Math.min(p.x, this.lowX);
      this.highX = Math.max(p.x, this.highX);
    });

    this.orbLength = this.highX - this.lowX;
    this.connect = true;

    this.fill = [
      "#cc0000",
      "#0000cc",
      "#00cc00",
      "#cc00cc",
      "#00cccc",
      "#cccc00",
      "#cccccc"
    ];

    this.radius = 0.1;
    this.time = 0;
    this.timeReducer = 500;
    this.timeReducer2 = 1000;
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
    orbPosition.x = (delta / this.timeReducer2) + orbPosition.x;
    orbPosition.y = ((this.yMax / 2) + orbPosition.y + this.yMax) % this.yMax;

    if (this.allOutOfBounds) {
      orbPosition.x = (orbPosition.x + this.xMax) % this.xMax - this.orbLength;
    }

    this.translateByPoint(orbPosition, this.orbs[orbIndex]);

    this.updateConnection(delta, orbPosition, orbIndex);
  }

  update(delta) {
    this.time = (this.time + (delta / this.timeReducer)) % this.xMax;

    this.pos.forEach(_.bind(this.preUpdateOrbPosition, this, delta));

    this.allOutOfBounds = this.pos.every(p => p.x > this.xMax * 1.05);

    this.pos.forEach(_.bind(this.updateOrbPosition, this, delta));
    this.pos.forEach(_.bind(this.postUpdateOrbPosition, this, delta));
  }

  updateStyles() {
    this.orbs.forEach((o, i) => o.fill = this.fill[i % this.fill.length]);

    this.connect && (this.connection.stroke = "#cccccc");
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

        this.orbs[i] = canvas.makeCircle(
          this.xScale(this.pos[i].x),
          this.yScale(this.pos[i].y),
          this.xScale(this.radius)
        );
      });

      points.push(true);

      if (this.connect) {
        this.connection = canvas.makePath.apply(canvas, points);
        this.connection.fill = "none";
      }

      this.orbs.forEach(o => o.addTo(this.element));
    }

    this.orbs.forEach(o => o.noStroke());

    this.updateStyles();
  }
}
