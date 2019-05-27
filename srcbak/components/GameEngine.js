import React from 'react';
import ReactDOM from 'react-dom';
import {Point} from '2d-engine';
import PlanetEntity from '../game-engine/PlanetEntity';
import UniverseEngine from '../game-engine/UniverseEngine';
import $ from 'jquery';

export default class GameEngine extends React.Component {
  constructor(props) {
    super(props);

    const height = 600;
    const width = 800;

    const engine = new UniverseEngine(
      '.canvas',
      width, height,
      (width * 4000) / height, 4000,
      {
        trackFPS: true,
        displayFPS: $('.fps')
      }
    );

    this.addSun(engine);
  }
  addSun(engine) {
    const entity = new PlanetEntity({
      mass: 2500000000,
      startingPosition: new Point(engine.xScale.domain()[1] / 2, engine.yScale.domain()[1] / 2),
      density: 10000000
    });

    entity.engine = engine;
    entity.entities = engine.entities;
    entity.isSun = true;
    engine.addEntity(entity);
  }

  render() {
    return (<div class="canvas"></div>);
  }
}
