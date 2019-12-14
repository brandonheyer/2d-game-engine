const BOUNCE_ABSORPTION_WALL = .98;

function updatePosPart(a, part, absorbtion) {
  if (a.pos[part] > a[`${part}Max`] - a.radius) {
    a.pos[part] = (a[`${part}Max`] - a.radius) - (a.pos[part] - (a[`${part}Max`] - a.radius));
    a.heading[part] *= a.dead ? 0 : -1 * absorbtion;
  } else if (a.pos[part] < a.radius) {
    a.pos[part] = a.radius - (a.pos[part] - a.radius);
    a.heading[part] *= a.dead ? 0 : -1 * absorbtion;
  }
}

function boundaryReflect(a, absorbtion = BOUNCE_ABSORPTION_WALL) {
  updatePosPart(a, "x", absorbtion);
  updatePosPart(a, "y", absorbtion);
}

export default boundaryReflect;
