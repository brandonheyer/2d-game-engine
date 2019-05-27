import $ from 'jquery';
import { TwoEngine } from '2d-engine';

import BallEntity from './BallEntity';

const STARTING_COUNT = 100;

const engine = new TwoEngine(
  '.canvas',
  600, 600,
  5000, 5000,
  {
    trackFPS: true,
    displayFPS: $('.fps')
  }
);

let entity;

for (var i = 0; i < STARTING_COUNT; i++) {
  entity = new BallEntity({
    engine: engine
  });
  entity.entities = engine.entities;
  console.log("position", entity.pos);
  console.log("heading", entity.heading);

  engine.addEntity(entity);
}

engine.start();
