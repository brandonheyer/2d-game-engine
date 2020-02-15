import { TwoEngine, random, seedrandom } from '2d-engine';

import addBalls from "./add-balls";
import BallEntity from './ball-entity';

export {
  addBalls,
  BallEntity
};

export function demo() {
  const engine = new TwoEngine(
    '.canvas',
    700, 700,
    1000, 1000
  );

  addBalls(engine);

  engine.start();
}

(() => window && (window.bounce = demo))();
