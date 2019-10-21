import { Point } from '2d-engine';
import BaseOrbs from "./BaseOrbs";

const HALF_PI = Math.PI / 2;
function round(value, points = 1) {
  const divisor = 10 * points;

  return Math.ceil(value * divisor) / 10;
}

export default class DualOrbs extends BaseOrbs {
  constructor(options) {
    super(
      Object.assign(
        {
          radius: 0.25,
          orbOptions: {
            trace: false,
            radius: .4,
            speed: 400,
            preUpdatePosition: function(delta) {
              const upDown = (this.index % 2) ? -1 : 1;
              const halfPos = this.pos.x / 2;

              this.pos.y = 2 * upDown * Math.sin(halfPos);
              this.pos.x += delta / 1000;

              const newScale = this.element.scale = Math.sin(
                halfPos +
                HALF_PI +
                ((this.index % 2) * Math.PI)
              ) + 2;

              this.element.opacity = round((newScale - 1) / 4 + .5);
            }
          }
        },
        options
      )
    );

    this.connect = false;
    this.below = false;
    this.passes = 0;
  }

  getOrbStartPositions() {
    return [
      new Point(0, this.yScale.domain()[1] / 2),
      new Point(0, this.yScale.domain()[1] / 2)
    ];
  }

  update(delta) {
    super.update(delta);

    const zero = this.orbs[0].element;
    const one = this.orbs[1].element;

    if (zero.scale < 2 && !this.below) {
      const newGroup = this.engine.canvas.makeGroup();

      newGroup.add(zero);
      newGroup.add(one);
      this.element.remove();
      this.element = newGroup;

      this.below = true;
      this.passes = (this.passes + 1) % 4;
    }
    else if (zero.scale >= 2 && this.below) {
      const newGroup = this.engine.canvas.makeGroup();

      newGroup.add(one);
      newGroup.add(zero);
      this.element.remove();
      this.element = newGroup;

      this.below = false;
      this.passes = (this.passes + 1) % 4;
    }
  }
}
