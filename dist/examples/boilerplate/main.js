import {Engine, BaseEntity} from '2d-engine';

var engine = new Engine(
  '.canvas',
  800, 800,
  10000, 10000,
  {}
);

engine.addEntity(new BaseEntity({
  xScale: engine.xScale,
  yScale: engine.yScale
}));
