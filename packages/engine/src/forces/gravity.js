const GRAVITY = 9.8;

function gravity(a, delta, gravity = GRAVITY) {
  a.heading.y = a.heading.y + (gravity / delta);
}

export default gravity;
