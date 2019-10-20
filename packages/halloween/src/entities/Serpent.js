import { Point } from '2d-engine';
import BaseOrbs from "./BaseOrbs";

export default class Serpent extends BaseOrbs {
  constructor(options) {
    super(Object.assign({
      connect: true
    }, options));
  }
  getOrbStartPositions() {
    return [
      new Point(0, this.yScale.domain()[1] / 2),
      new Point(Math.PI * .125, this.yScale.domain()[1] / 2),
      new Point(Math.PI * .25, this.yScale.domain()[1] / 2),
      new Point(Math.PI * .375, this.yScale.domain()[1] / 2),
      new Point(Math.PI * .5, this.yScale.domain()[1] / 2),
      new Point(Math.PI * .625, this.yScale.domain()[1] / 2),
      new Point(Math.PI * .75, this.yScale.domain()[1] / 2),
      new Point(Math.PI * .875, this.yScale.domain()[1] / 2),
      new Point(Math.PI * 1, this.yScale.domain()[1] / 2)
    ];
  }

  preUpdateOrbPosition(delta, orbPosition, orbIndex) {
    orbPosition.x += delta / 300;
    orbPosition.y = ((orbIndex % 2) ? -1 : 1) * 2 * Math.sin(orbPosition.x / 2);
  }

  render(canvas) {
    super.render(canvas);

    this.connection.curved = true;
  }
}
