import {TwoEngine, SVGEngine, BaseEntity} from '2d-engine';
import BallEntity from './BallEntity';
import $ from 'jquery';

const STARTING_COUNT = 250;

var entity;
var engine = new TwoEngine(
  '.canvas',
  800, 800,
  10000, 10000,
  {
    trackFPS: true,
    displayFPS: $('.fps')
  }
);

for (var i = 0; i < STARTING_COUNT; i++) {
  entity = new BallEntity();
  entity.entities = engine.entities;

  engine.addEntity(entity);
}

engine.start();
