import _ from 'lodash';
import * as d3 from 'd3';
import $ from 'jquery';

import {Vector, Engine as BaseEngine} from '2d-engine';

class Engine extends BaseEngine {
  constructor(svgClass, pixelX, pixelY, worldX, worldY, options) {
    super(svgClass, pixelX, pixelY, worldX, worldY, options);

    this.anchors = [];
    this.drawPoint = undefined;
    this.firstArm = options.firstArm || 2400;
    this.secondArm = options.secondArm || 2200;
    this.runTime = 0;
  }

  addAnchorEntity(entity) {
    this.addEntity(entity);
    this.anchors.push(entity);
  }

  addDrawEntity(entity) {
    this.addEntity(entity);
    this.drawPoint = entity;
  }

  addEntity(entity) {
    super.addEntity(entity);

    entity.engine = this;
  }

  calculateAngle(l1, l2, l3) {
    var numer = (l2 * l2) + (l3 * l3) - (l1 * l1);
    var denom = 2 * l2 * l3;

    return Math.acos(numer / denom);
  }

  clear() {
    if (this.drawPoint) {
      this.drawPoint.clear();
    }

    this.runTime = 0;
  }

  process(delta) {
    var anchorDistance;
    var oppFirstArm;
    var oppSecondArm;
    var oppAnchorArm;
    var newX, newX2, nextX;
    var newY, newY2, nextY;
    var rotationAngle;
    var cosR;
    var sinR;
    var x3;
    var x1, y1, x2, y2;
    var x2s, y2s;
    var x2r, y2r;
    var drawX, drawY;
    var ninetyDegrees = Math.PI / 2;

    if (this.paused) {
      if (!_.isNaN(this.drawPoint.pos.x)) {
        x2 = this.drawPoint.pos.x;
      }

      if (!_.isNaN(this.drawPoint.pos.y)) {
        y2 = this.drawPoint.pos.y;
      }
    } else {
      this.runTime += delta;

      x1 = this.anchors[0].anchorPos.x;
      y1 = this.anchors[0].anchorPos.y;
      x2 = this.anchors[1].anchorPos.x;
      y2 = this.anchors[1].anchorPos.y;

      anchorDistance = this.anchors[1].anchorPos.minus(this.anchors[0].anchorPos).magnitude();

      oppSecondArm = this.calculateAngle(this.secondArm, this.firstArm, anchorDistance);

      x2s = y1 - y2;
      y2s = x2 - x1;

      rotationAngle = Math.atan(x2s / y2s);
      cosR = Math.cos(rotationAngle);
      sinR = Math.sin(rotationAngle);

      x2r = (x2s * cosR) - (y2s * sinR);
      y2r = (x2s * sinR) + (y2s * cosR);

      drawX = Math.sin(oppSecondArm) * this.firstArm;
      drawY = Math.cos(oppSecondArm) * this.firstArm;

      cosR = Math.cos(-1 * rotationAngle);
      sinR = Math.sin(-1 * rotationAngle);

      x2r = (drawX * cosR) - (drawY * sinR);
      y2r = (drawX * sinR) + (drawY * cosR);

      x2s = y2r;
      y2s = -1 * x2r;

      x2 = x2s + x1;
      y2 = y2s + y1;

      if (!_.isNaN(x2)) {
        this.drawPoint.pos.x = x2;
      }

      if (!_.isNaN(y2)) {
        this.drawPoint.pos.y = y2;
      }
    }

    this.anchors[0].armElement
      .attr('x1', this.xScale(this.anchors[0].anchorPos.x))
      .attr('x2', this.xScale(x2))
      .attr('y1', this.yScale(this.anchors[0].anchorPos.y))
      .attr('y2', this.yScale(y2));

    this.anchors[1].armElement
      .attr('x1', this.xScale(this.anchors[1].anchorPos.x))
      .attr('x2', this.xScale(x2))
      .attr('y1', this.yScale(this.anchors[1].anchorPos.y))
      .attr('y2', this.yScale(y2));

    super.process(delta);
  }

  tick() {
    var newLast = +(new Date());
    var delta = this.delta = newLast - this.last;
    var rot1, rot2, rot3;

    this.last = newLast;

    this.elements = this.svg.selectAll('g.entity')
      .data(this.entities);

    this.enterElements();
    this.exitElements();

    this.elements = this.svg.selectAll('g.entity');

    rot1 = this.anchors[0].rotationSpeed * (this.runTime / 1000);
    rot2 = this.anchors[1].rotationSpeed * (this.runTime / 1000);
    rot3 = this.drawPoint.speed * (this.runTime / 1000);

    if (360 < Math.min(Math.min(rot1, rot2), rot3)) {
      this.paused = true;
    }

    this.process(delta);

    this.timeout = setTimeout(this.tick.bind(this), (32 - (1000 / this.average) || 0));
  }
}

export default Engine;
