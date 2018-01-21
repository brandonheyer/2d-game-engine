import {SVGEngine, BaseEntity} from '2d-engine';
import BallEntity from './BallEntity';

const STARTING_COUNT = 30;

var entity;
var engine = new SVGEngine(
  '.canvas',
  800, 800,
  10000, 10000
);

for (var i = 0; i < STARTING_COUNT; i++) {
  entity = new BallEntity();
  entity.entities = engine.entities;

  engine.addEntity(entity);
}

engine.start();
