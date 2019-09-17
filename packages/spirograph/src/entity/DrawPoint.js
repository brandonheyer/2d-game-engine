import {BaseEntity, Point, Vector} from '2d-engine';

const ACCURACY = 2.5;

class DrawPoint extends BaseEntity {
  constructor(options) {
    super(options);

    this.radius = 5;
    this.pathString = '';
    this.center = new Point(this.xScale.domain()[1] / 2, this.yScale.domain()[1] / 2);

    this.rotation = 0;
    this.speed = options.speed || 5;
    this.splitTime = this.startSplitTime = 10000;
  }

  nextUpdate(delta) {
    var nextX;
    var nextY;
    var cosR;
    var sinR;
    var rx;
    var ry;

    if (!this.engine.paused) {
      this.rotation = this.rotation + (this.speed * delta / 1000) % 360;
    }

    this.splitTime -= delta;

    if (this.splitTime < 0) {
      this.addPath();

      this.pathString = this.lastPath + ' ';
      this.splitTime = this.startSplitTime;
    }

    this.pointElement
      .attr('cx', this.xScale(this.pos.x))
      .attr('cy', this.yScale(this.pos.y));

    cosR = Math.cos(this.rotation * Math.PI / 180);
    sinR = Math.sin(this.rotation * Math.PI / 180);

    nextX = this.pos.x - (this.center.x);
    nextY = this.pos.y - (this.center.y);

    rx = (nextX * cosR) - (nextY * sinR);
    ry = (nextX * sinR) + (nextY * cosR);

    this.nextX = Math.round(this.xScale(rx + this.center.x) * ACCURACY) / ACCURACY;
    this.nextY = Math.round(this.yScale(ry + this.center.y) * ACCURACY) / ACCURACY;

    // Avoid drawing duplicate points
    if (this.nextX !== this.lastX && this.nextY !== this.lastY) {
      this.lastX = this.nextX;
      this.lastY = this.nextY;

      // this.lastPath = this.lastX + ',' + this.lastY;
      // this.pathString += this.lastPath + ' ';
      //
      // this.pathElement
      //   .attr('points', this.pathString)

      this.lastPath = this.lastX + ' ' + this.lastY;
      this.pathString += this.lastPath + ' L ';

      this.pathElement
        .attr('d', 'M ' + this.pathString.slice(0, -2));
    } else {
      // console.log('duplicate');
    }

    this.pathGroup
      .attr(
        'transform',
        'translate(' + this.xScale(this.center.x) + ', ' + this.yScale(this.center.y) + ')' +
        'rotate(' + (-1 * this.rotation) + ')'  +
        'translate(' + (-1 * this.xScale(this.center.x)) + ', ' + (-1 * this.yScale(this.center.y)) + ')'
      );
  }

  update(delta) {
    if (!this.engine.paused) {
      this.update = this.nextUpdate;
    }
  }

  updateStyles() {
    this.pointElement
      .attr('r', this.xScale(this.radius))
      .attr('fill', '#dd0d0d');
  }

  destroy() {
    this.element.remove();
    this.element = undefined;
  }

  /**
   * Clear all polylines from the drawing
   */
  clear() {
    this.pathElement.remove();
    this.pathElement = undefined;
    this.pathString = '';

    this.pathGroup.selectAll('path').remove();

    this.addPath();
  }

  addPath() {
    this.pathElement = this.pathGroup.append('path');

    this.pathElement
      .attr('fill', 'none')
      .attr('stroke', '#d0eeee');
  }

  render(canvas) {
    if (!this.element) {
      this.element = canvas.append('g');
      this.pathGroup = this.element.append('g');
      this.pointElement = this.element.append('circle');

      this.addPath();
      this.updateStyles();
    }
  }
}

export default DrawPoint;
