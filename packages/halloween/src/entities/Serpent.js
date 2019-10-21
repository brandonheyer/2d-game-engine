import { Point } from '2d-engine';
import BaseOrbs from "./BaseOrbs";

export default class Serpent extends BaseOrbs {
  constructor(options) {
    super(
      Object.assign(
        {
          connect: true,
          orbOptions: {
            preUpdatePosition: function(delta) {
              this.pos.y = ((this.index % 2) ? -1 : 1) * 2 * Math.sin(this.pos.x / 2);
            },
            trace: false,
            radius: .4,
            speed: 400
          }
        },
        options
      )
    );
  }

  getOrbStartPositions() {
    return [
      new Point(0, this.yScale.domain()[1] / 2),
      new Point(Math.PI * .25, this.yScale.domain()[1] / 2),
      new Point(Math.PI * .5, this.yScale.domain()[1] / 2),
      new Point(Math.PI * .75, this.yScale.domain()[1] / 2),
      new Point(Math.PI * 1, this.yScale.domain()[1] / 2),
      new Point(Math.PI * 1.25, this.yScale.domain()[1] / 2),
      new Point(Math.PI * 1.5, this.yScale.domain()[1] / 2),
      new Point(Math.PI * 1.75, this.yScale.domain()[1] / 2),
      new Point(Math.PI * 2, this.yScale.domain()[1] / 2),
      new Point(Math.PI * 2.25, this.yScale.domain()[1] / 2)
    ];
  }

  render(canvas) {
    super.render(canvas);

    this.connection.curved = true;
  }
}
