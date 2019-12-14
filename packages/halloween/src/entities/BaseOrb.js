import _ from "lodash";
import { BaseEntity, Point } from '2d-engine';

export const FILLS = [
  "#F2D16D",
  "#CF1F9F",
  "#F29C50",
  "#A9C2D9",
  "#F27649",
  "#F28705",
  "#9592A6",
];

let instances = 0;

export default class BaseOrbs extends BaseEntity {
  constructor(options) {
    super(options);

    this.instance = instances;
    instances++;

    this.preUpdatePosition = options.preUpdatePosition || this.preUpdatePosition;
    this.preUpdatePosition = this.preUpdatePosition.bind(this);

    this.postUpdateOrbPosition = options.postUpdateOrbPosition || this.postUpdatePosition;
    this.postUpdatePosition = this.postUpdatePosition.bind(this);

    this.updatePosition = options.updatePosition || this.updatePosition;
    this.updatePosition = this.updatePosition.bind(this);

    this.radius = options.radius || 0.1;
    this.speed = options.speed || 500;
    this.overflowScale = 1.05;
    this.moveSlow = options.moveSlow || 500;
    this.glowSlow = options.glowSlow || .5;
    this.glowOrbs = options.glowOrbs || 6;
    this.engine = options.engine;
    this.fill = options.fill || FILLS[this.instance % FILLS.length];

    this.trace = options.trace === undefined ? true : options.trace;
    this.tracerStroke = options.tracerStroke || FILLS[this.instance % FILLS.length];
    this.tracerWidth = options.tracerWidth || (this.radius * .1);

    this.glowSpeed = Math.floor(Math.random() * 50 + 50) / (25 * this.glowSlow);

    this.kickback = options.kickback;
    if (options.kickback !== false) {
      this.totalTime = this.time = -2 * this.radius;
    }
    else {
      this.totalTime = this.time = -2 * .4;
    }

    this.pos.x = this.time - (this.pos.x || 0);
  }

  preUpdatePosition(delta) {}
  postUpdatePosition(delta) {}

  updatePosition(delta) {
    this.pos.x += delta / this.speed;
    this.pos.y = (this.pos.y + (this.yMax / 2)) % this.yMax;

    if (this.pos.x > this.xMax) {
      this.drawPath = false;
    }

    if (this.pos.x > this.xMax + (this.radius * 3)) {
      if (this.kickback !== false) {
        this.pos.x = -2 * this.radius;
      }
      else {
        this.pos.x = -2 * .4;
      }
    }

    for (let i = 0; i < this.glowGroup.children.length - 1; i++) {
      const currOrb = this.glowGroup.children[i];
      const speed = this.glowSpeed;

      currOrb.scale = .5 + Math.abs(
        Math.sin(
          this.totalTime / 3 * speed * (1 + (i * 0.15))
        )
      ) * (1 + (i * 0.1));
    }

    this.translateByPoint(this.pos);
  }

  update(delta) {
    this.time = (this.time + (delta / this.speed));
    if (this.time > this.xMax) {
      this.time -= this.xMax;
    };

    this.totalTime += delta / this.speed;

    this.preUpdatePosition(delta);
    this.updatePosition(delta);
    this.postUpdatePosition(delta);

    if (this.drawPath) {
      const anchor = new Two.Anchor(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y)
      );

      this.pathElement.vertices.push(anchor);
    }

    if (this.trace) {
      this.pathElement.opacity = .25 + Math.abs((Math.sin(this.totalTime) / 3));
    }
  }

  addPath() {
    this.pathElement = new Two.Path([], false, false);
    this.pathElement.addTo(this.canvas);

    this.pathString = "";

    this.pathElement.fill = "none";
    this.pathElement.stroke = this.tracerStroke;
    this.pathElement.linewidth = this.xScale(this.tracerWidth);
    this.pathElement.opacity = .25;

    this.drawPath = 2;
  }

  render(canvas) {
    this.canvas = canvas;

    if (this.trace) {
      this.addPath();
    }

    this.element = canvas.makeGroup();
    this.glowGroup = canvas.makeGroup();

    let tempOrb;
    for (let j = this.glowOrbs; j >= 0; j--) {
      tempOrb = canvas.makeCircle(
        this.xScale(0),
        this.yScale(0),
        this.xScale(this.radius * (1 + (j * 0.063)))
      );

      tempOrb.noStroke();
      tempOrb.fill = this.fill;
      tempOrb.opacity = j * 0.02;

      tempOrb.addTo(this.glowGroup);
    }

    tempOrb = canvas.makeCircle(
      this.xScale(0),
      this.yScale(0),
      this.xScale(this.radius)
    );

    tempOrb.fill = this.fill;
    tempOrb.noStroke();

    this.glowGroup.addTo(this.element);
    tempOrb.addTo(this.element);
  }
}
