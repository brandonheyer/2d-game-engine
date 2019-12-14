const GRAVITY = 9.8;

function gravity(a, delta, gravity = GRAVITY) {
  this.heading.y = this.heading.y + (GRAVITY / delta);
}

export default gravity;
