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
          radius: 0.25
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

  preUpdateOrbPosition(delta, orbPosition, orbIndex) {
    const upDown = (orbIndex % 2) ? -1 : 1;
    const halfPos = orbPosition.x / 2;

    orbPosition.y = 2 * upDown * Math.sin(halfPos);
    orbPosition.x += delta / 1000;

    const newScale = this.orbs[orbIndex].scale = Math.sin(
      halfPos +
      HALF_PI +
      ((orbIndex % 2) * Math.PI)
    ) + 2;

    this.orbs[orbIndex].opacity = round((newScale - 1) / 4 + .5);
  }

  update(delta) {
    super.update(delta);

    const zero = this.element.children[0];
    const one = this.element.children[1];
    const markOrb = this.passes < 2 ? 0 : 1;

    if (this.orbs[markOrb].scale < 2 && !this.below) {
      const newGroup = this.engine.canvas.makeGroup();
      newGroup.add(this.element.children[0]);
      newGroup.add(this.element.children[0]);
      this.element = newGroup;

      this.below = true;
      this.passes = (this.passes + 1) % 4;
    }
    else if (this.orbs[markOrb].scale >= 2 && this.below) {
      const newGroup = this.engine.canvas.makeGroup();
      newGroup.add(this.element.children[1]);
      newGroup.add(this.element.children[0]);
      this.element = newGroup;

      this.below = false;
      this.passes = (this.passes + 1) % 4;
    }
  }
}
