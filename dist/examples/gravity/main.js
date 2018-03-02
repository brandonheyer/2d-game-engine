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
  (width * 4000) / height, 4000,
  {
    trackFPS: true,
    displayFPS: $('.fps')
  }
);

let controlRun = $('#control-run');
let controlRestart = $('#control-restart');

function addSun() {
  entity = new PlanetEntity({
    mass: 20000000000,
    startingPosition: new Point(engine.xScale.domain()[1] / 2, engine.yScale.domain()[1] / 2),
    density: 1024000
  });

  entity.engine = engine;
  entity.entities = engine.entities;
  entity.isSun = true;
  engine.addEntity(entity);
}

addSun();

controlRun.click(() => {
  if (engine.running) {
    engine.stop();
    controlRun.val('Start');
  } else {
    engine.start();
    controlRun.val('Pause');
  }
});

controlRestart.click(() => {
  engine.clear();

  controlRun.val('Start');
  addSun();
  engine.canvas.render();
});

engine.start();
