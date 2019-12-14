import $ from 'jquery';
import { TwoEngine, random, seedrandom } from '2d-engine';

import BallEntity from './BallEntity';

const STARTING_COUNT = 100;

const engine = new TwoEngine(
  '.canvas',
  700, 700,
  1000, 1000
);

window.random = random;
window.seedrandom = seedrandom;

engine.randomXPos = random.clone(seedrandom("bounce-pos-x"))
  .uniformInt(0, engine.xMax);
engine.randomYPos = random.clone(seedrandom("bounce-pos-y"))
  .uniformInt(0, engine.yMax);

for (let i = 0; i < STARTING_COUNT; i++) {
  const entity = new BallEntity({
    engine: engine
  });

  entity.index = i;
  entity.entities = engine.entities;
  entity.engine = engine;

  engine.addEntity(entity);
}

let iterations = 0;
let logTime = 0;
const oldTick = engine.tick.bind(engine);



// engine.tick = function() {
//   iterations++;
//
//   if (iterations > 500) {
//     console.profileEnd();
//     engine.tick = oldTick;
//   }
//
//   return oldTick();
// }

// console.profile();

engine.start();
