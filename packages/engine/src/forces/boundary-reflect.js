const BOUNCE_ABSORPTION_WALL = .98;

function updatePosPart(a, part) {
  if (a.pos[part] > a[`${part}Max`] - a.radius) {
    a.pos[part] = (a[`${part}Max`] - a.radius) - (a.pos[part] - (a[`${part}Max`] - a.radius));
  } else if (a.pos[part] < a.radius) {
    a.pos[part] = a.radius - (a.pos[part] - a.radius);
  }

  a.heading[part] *= a.dead ? 0 : -1 * BOUNCE_ABSORPTION_WALL;
}

function boundaryReflect(a, absorbtion = BOUNCE_ABSORPTION_WALL) {
  updatePosPart(a, "x");
  updatePosPart(a, "y");
}

export default boundaryReflect;
