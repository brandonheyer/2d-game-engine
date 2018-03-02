import {Point} from '2d-engine';
import PlanetEntity from './PlanetEntity';
import UniverseEngine from './UniverseEngine';
import $ from 'jquery';

var entity;
var width = $('body').innerWidth();
var height = $('body').innerHeight();

var engine = new UniverseEngine(
  '.canvas',
  width, height,
  (width * 5000) / height, 5000,
  {
    trackFPS: true,
    displayFPS: $('.fps')
  }
);

entity = new PlanetEntity({
  mass: 10000000000,
  startingPosition: new Point(engine.xScale.domain()[1] / 2, engine.yScale.domain()[1] / 2),
  density: 1024000
});

entity.engine = engine;
entity.entities = engine.entities;
entity.isSun = true;
engine.addEntity(entity);

// entity = new PlanetEntity({
//   mass: 6000000,
//   startingPosition: new Point((engine.xScale.domain()[1] / 2 + 700), engine.yScale.domain()[1] / 2),
//   radius: 50,
//   headingX: .06,
//   headingY: -1.95
// });
// entity.engine = engine;
// entity.entities = engine.entities;
// engine.addEntity(entity);
//
// entity = new PlanetEntity({
//   mass: 6000000,
//   startingPosition: new Point((engine.xScale.domain()[1] / 2) - 700, engine.yScale.domain()[1] / 2),
//   radius: 50,
//   headingX: -.06,
//   headingY: 1.95
// });
// entity.engine = engine;
// entity.entities = engine.entities;
// engine.addEntity(entity);

engine.start();
