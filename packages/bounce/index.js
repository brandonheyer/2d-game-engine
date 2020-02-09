import { TwoEngine, random, seedrandom } from '2d-engine';

import addBalls from "./add-balls";
import BallEntity from './ball-entity';
import BaseBallEntity from './base-ball-entity';

export {
  addBalls,
  BallEntity,
  BaseBallEntity
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
