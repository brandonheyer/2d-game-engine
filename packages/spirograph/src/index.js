import $ from 'jquery';
import _ from 'lodash';
import queryString from 'query-string';

import {Point} from '2d-engine';

import Engine from './engine/Engine';
import Anchor from './entity/Anchor';
import DrawPoint from './entity/DrawPoint';

var w = $(document).width();
var h = $(document).height();
var controls = $('.sp-inputs');
var controlInputs = {};

var settings = queryString.parse(location.hash.replace('#', ''));

var buttonStop;
var buttonStart;
var buttonClear;
var engine;
var firstAnchor;
var secondAnchor;
var drawPoint;

engine = new Engine(
  '.sp-canvas',
  w, h,
  8000, (8000 * h) / w,
  {
    firstArm: settings.firstArm || 2500,
    secondArm: settings.secondArm || 2500,
    trackFPS: true,
    displayFPS: $('.sp-fps')
  }
);

_.defaults(settings, {
  firstArm: 2500,
  secondArm: 2500,

  x1: 2500,
  y1: (engine.yScale.domain()[1] * .85),
  radius1: 500,
  offset1: 250,
  speed1: 10,

  x2: 5500,
  y2: (engine.yScale.domain()[1] * .85),
  radius2: 500,
  offset2: 250,
  speed2: 10,

  rotationSpeed: 1
});

_.each(settings, function(v, k) {
  var div = $('<div class="sp-control"><label class="sp-control-label" for=' + k + '">' + k + ':</label></div>');

  settings[k] = parseFloat(v);
  controlInputs[k] = $('<input class="sp-control-input" type="text" id="' + k + '" value="' + v + '" />').appendTo(div);

  controls.append(div);
});

firstAnchor = new Anchor({
  xScale: engine.xScale,
  yScale: engine.yScale,
  startingPosition: new Point(settings.x1, settings.y1),
  radius: settings.radius1,
  offset: settings.offset1,
  speed: settings.speed1,
  engine: engine
});
engine.addAnchorEntity(firstAnchor);

secondAnchor = new Anchor({
  xScale: engine.xScale,
  yScale: engine.yScale,
  startingPosition: new Point(settings.x2, settings.y2),
  radius: settings.radius2,
  offset: settings.offset2,
  speed: settings.speed2,
  engine: engine
});
engine.addAnchorEntity(secondAnchor);

drawPoint = new DrawPoint({
  xScale: engine.xScale,
  yScale: engine.yScale,
  startingPosition: new Point(
    ((settings.x2 - settings.x1) / 2),
    engine.yScale.domain()[1] * .8
  ),
  speed: settings.rotationSpeed,
  engine: engine
});
engine.addDrawEntity(drawPoint);

location.hash = queryString.stringify(settings);

engine.start();
engine.paused = true;

buttonStop = $('.sp-button-stop').click(() => {
  buttonStart.attr('disabled', false);
  buttonClear.attr('disabled', false);

  buttonStop.attr('disabled', 'disabled');

  engine.paused = engine.stopped = true;
});

buttonStart = $('.sp-button-start').click(() => {
  buttonStop.attr('disabled', false);

  buttonStart.attr('disabled', 'disabled');
  buttonClear.attr('disabled', 'disabled');

  engine.paused = engine.stopped = false;
});

buttonClear = $('.sp-button-clear').click(() => {
  engine.clear();
});

$('.sp-inputs').on('change', () => {
  _.each(settings, function(v, selector) {
    settings[selector] = $('#' + selector).val();
    location.hash = queryString.stringify(settings);
  });

  engine.firstArm = parseInt(settings.firstArm, 10);
  engine.secondArm = parseInt(settings.secondArm, 10);

  firstAnchor.pos.x = parseInt(settings.x1, 10);
  firstAnchor.pos.y = parseInt(settings.y1, 10);
  firstAnchor.rotationSpeed = parseFloat(settings.speed1);
  firstAnchor.offset = parseInt(settings.offset1, 10);

  secondAnchor.pos.x = parseInt(settings.x2, 10);
  secondAnchor.pos.y = parseInt(settings.y2, 10);
  secondAnchor.rotationSpeed = parseFloat(settings.speed2);
  secondAnchor.offset = parseInt(settings.offset2, 10);

  drawPoint.speed = parseFloat(settings.rotationSpeed);
});
