let overlap;
function separation(a, b, force, mag) {
  overlap = Math.abs(mag - a.radius - b.radius);

  a.pos.x += force.x * overlap / 2;
  a.pos.y += force.y * overlap / 2;

  b.pos.x += force.x * overlap / -2;
  b.pos.y += force.y * overlap / -2;
}

module.exports = separation;
