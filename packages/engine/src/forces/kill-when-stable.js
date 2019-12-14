const STABLE_ITERATIONS = 100;

export function initKillWhenStable(a) {
  a.stableIterations = 0;
}

export function killWhenStable(a, iterations = STABLE_ITERATIONS) {
  if (!a.dead) {
    if (
      Math.abs(a.xScale(a.pos.x) - a.element.translation.x) +
      Math.abs(a.yScale(a.pos.y) - a.element.translation.y) < 1
    ) {
      a.stableIterations++;
    }
    else if (a.stableIterations > 0){
      a.stableIterations--;
    }

    if (a.stableIterations > iterations) {
      a.dead = true;
    }
  }
}
