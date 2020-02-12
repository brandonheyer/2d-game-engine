import React from 'react';
import $ from 'jquery';
import _debounce from 'lodash.debounce';
import { Point } from '2d-engine';

import SunEntity from './game-engine/SunEntity';
import UniverseEngine from './game-engine/UniverseEngine';

const AppEngine = function(width, height) {
  AppEngine.instance = AppEngine.initialize(width, height);

  return AppEngine.instance;
}

AppEngine.addSun = function() {
  const engine = AppEngine.instance;
  const entity = new SunEntity({
    mass: 2500000000,
    startingPosition: new Point(engine.xScale.domain()[1] / 2, engine.yScale.domain()[1] / 2),
    density: 1000000,
    engine
  });

  engine.zoomEnabled = false;

  engine.addEntity(entity);
  engine.sun = entity;
};

AppEngine.initialize = function(width, height) {
  const e = new UniverseEngine(
    '.canvas',
    width, height,
    (width * 10000) / height, 10000,
    {
      trackFPS: true,
      displayFPS: $('.fps')
    }
  );

  $(window).on('resize', _debounce(() => {
    e.xScale.range([0, window.innerWidth]);
    e.scale.range([0, window.innerWidth]);
    e.yScale.range([0, window.innerHeight]);
    e.canvas.width = window.innerWidth;
    e.canvas.height = window.innerHeight;
  }, 100));

  return e;
}

export default AppEngine;

export const EngineContext = React.createContext(
  AppEngine
);
