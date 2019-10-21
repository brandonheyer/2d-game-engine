import _ from "lodash";
import { BaseEntity, Point } from '2d-engine';
import BaseOrb, { FILLS } from "./BaseOrb";

export default class BaseOrbs extends BaseEntity {
  constructor(options) {
    super(options);

    const startingPoses = options.getOrbStartPositions ? options.getOrbStartPosition() : this.getOrbStartPositions();

    this.startingXs = startingPoses.map(p => p.x);

    this.orbs = [];
    this.lowX = Infinity;
    this.highX = -Infinity;
    this.fill = FILLS;
    this.time = 0;
    this.totalTime = 0;

    startingPoses.forEach((p, i) => {
      const orbOptions = options.orbOptions || {};
      const radius = orbOptions.radius || this.radius;

      this.startingXs[i] = p.x + (3 * radius);

      this.lowX = Math.min(this.startingXs[i], this.lowX);
      this.highX = Math.max(this.startingXs[i], this.highX);

      this.orbs.push(
        new BaseOrb(
          Object.assign(
            {
              engine: options.engine,
              startingPosition: p,
              radius
            },
            options.orbOptions || {}
          )
        )
      );

      this.orbs[this.orbs.length - 1].index = this.orbs.length - 1;
    });

    this.orbs.forEach(o => o.xMax += (this.highX - this.lowX));

    this.engine = options.engine;
    this.connect = options.connect || false;
    this.open = !options.closed;

  }

  getDefaultStartPosition() {
    return new Point(0, this.yScale.domain()[1] / 2);
  }

  getOrbStartPositions() {
    return [];
  }

  updateConnection(delta, orbPosition, orbIndex) {
    if (this.allOutOfBounds) {
      orbPosition.x =  -1 * this.startingXs[orbIndex];
    }

    if (this.connect) {
      // this.connection.transform = "none";
      this.connection.vertices[orbIndex].x = this.xScale(orbPosition.x);
      this.connection.vertices[orbIndex].y = this.yScale(orbPosition.y);
    }
  }

  update(delta) {
    this.time = (this.time + (delta / this.timeReducer)) % this.xMax;
    this.totalTime += delta / this.timeReducer;

    this.allOutOfBounds = this.orbs.every(
      o => o.pos.x > (this.xMax + (o.radius * 2 * o.element.scale))
    );

    this.orbs.forEach(o => o.update(delta));

    this.orbs.forEach((o, i) => this.updateConnection(delta, o.pos, i));
  }

  destroy() {
    this.orbs.forEach(o => o.element.remove());
    this.orbs = [];

    this.connect && this.connection.remove();

    this.element.remove();
    this.element = undefined;
  }

  render(canvas) {
    this.element = canvas.makeGroup();

    if (this.connect) {
      const points = [];
      points.length = this.orbs.length * 2;
      points.fill(0);
      points.push(this.open);

      this.connection = canvas.makePath.apply(canvas, points);
      this.connection.fill = "none";
      this.connection.stroke = "#cccccc"
      this.connection.linewidth = 5;

      this.element.add(this.connection);
    }

    this.orbs.forEach(o => {
      o.render(canvas);

      this.element.add(o.element);
    });
  }
}
