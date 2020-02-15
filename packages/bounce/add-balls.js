import { random, seedrandom } from '2d-engine';
import BallEntity from './ball-entity';

const STARTING_COUNT = 250;

export default function addBalls(engine, count = STARTING_COUNT, options = {}) {
  engine.randomXPos = random.clone(seedrandom("bounce-pos-x"))
    .uniformInt(0, engine.xMax);
  engine.randomYPos = random.clone(seedrandom("bounce-pos-y"))
    .uniformInt(0, engine.yMax);

  for (let i = 0; i < count; i++) {
    const ballOpts = typeof(options) === "function" ? options() : options;
    const entity = new BallEntity(Object.assign({
      engine: engine
    }, ballOpts));

    entity.index = i;

    engine.addEntity(entity);
  }
}
