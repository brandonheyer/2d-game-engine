import * as d3 from 'd3';
import {Point, Vector, BaseEntity} from '2d-engine';

export default class GeneratorEntity extends BaseEntity {
  constructor(options) {
    super(options);

    options = options || {};
  }

  calculate(delta) {

  }

  update(delta) {

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

    this.element.fill = d3.interpolateViridis(SCALE(this.density));
    this.element.noStroke();
  }

  destroy() {
    this.canvas.remove(this.element);
  }
}
