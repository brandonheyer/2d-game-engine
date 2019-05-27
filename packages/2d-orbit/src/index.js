import React from 'react';
import ReactDOM from 'react-dom';

import PortalEntity from './game-engine/PortalEntity';

import UI from './components/UI';

import AppEngine from "./AppEngine"

import "./index.css";

const height = window.innerHeight;
const width = window.innerWidth;

const engine = AppEngine(width, height);

// const portalStart = new PortalEntity({
//   size: 250,
//   startingPosition: new Point(engine.xScale.domain()[1] / 2, engine.yScale.domain()[1] / 4),
//   engine: engine,
//   rotation: Math.PI
// });
//
// const portalEnd = new PortalEntity({
//   size: 250,
//   startingPosition: new Point(engine.xScale.domain()[1] / 2, 3 * engine.yScale.domain()[1] / 4),
//   engine: engine,
//   sister: portalStart,
//   rotation: Math.PI
// });
//
// const portalStart2 = new PortalEntity({
//   size: 250,
//   startingPosition: new Point(engine.xScale.domain()[1] / 4, engine.yScale.domain()[1] / 2),
//   engine: engine,
//   rotation: 27 * Math.PI / 18
// });
//
// const portalEnd2 = new PortalEntity({
//   size: 250,
//   startingPosition: new Point(3 * engine.xScale.domain()[1] / 4, engine.yScale.domain()[1] / 2),
//   engine: engine,
//   sister: portalStart,
//   rotation: Math.PI / 2
// });
//
// portalStart.sister = portalEnd;
// portalEnd.sister = portalStart;
//
// portalStart2.sister = portalEnd2;
// portalEnd2.sister = portalStart2;
//
// engine.addEntity(portalStart);
// engine.addEntity(portalEnd);
// engine.addEntity(portalStart2);
// engine.addEntity(portalEnd2);

AppEngine.addSun();

engine.start();

// ========================================

ReactDOM.render(
  React.createElement(UI),
  document.getElementById('root')
);

module.hot.accept();
