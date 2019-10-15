import { Point } from '2d-engine';
import BaseOrbs from "./BaseOrbs";

export default class DualOrbs extends BaseOrbs {
  constructor(options) {
    super(options);

    this.connect = false;
    this.below = false;
    this.radius = 0.25;
    this.engine = options.engine;
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

    orbPosition.x += delta / 300;

    const sin = Math.sin(orbPosition.x / 2);
    orbPosition.y = upDown * 2 * sin;

    this.orbs[orbIndex].scale = Math.sin(
      (orbPosition.x / 2) +
      (Math.PI / 2) +
      ((orbIndex % 2) * Math.PI)
    ) + 2;

    this.orbs[orbIndex].opacity = (this.orbs[orbIndex].scale - 1) / 6 + .5;
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
      // this.element.remove();
      this.element = newGroup;

      this.below = true;
      this.passes = (this.passes + 1) % 4;
      // this.element.children[0].addTo(this.element);
    }
    else if (this.orbs[markOrb].scale >= 2 && this.below) {
      const newGroup = this.engine.canvas.makeGroup();
      newGroup.add(this.element.children[1]);
      newGroup.add(this.element.children[0]);
      // this.element.remove();
      this.element = newGroup;

      // this.element.children[0].addTo(this.element);

      this.below = false;
      this.passes = (this.passes + 1) % 4;
    }
  }
}
