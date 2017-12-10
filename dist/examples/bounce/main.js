import {Engine, BaseEntity} from '2d-engine';
import BallEntity from './BallEntity';

var entity;
var engine = new Engine(
  '.canvas',
  800, 800,
  10000, 10000
);

for (var i = 0; i < 3; i++) {
  entity = new BallEntity();
  entity.entities = engine.entities;

  engine.addEntity(entity);
}

engine.start();
