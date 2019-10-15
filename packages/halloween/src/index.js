import _ from "lodash";
import $ from "jquery";

import {Point} from "2d-engine";

import Engine from "./engine/Engine";
import BaseBoid from "./entities/BaseBoid";
import DualOrbs from "./entities/DualOrbs";
import Serpent from "./entities/Serpent";

const defaultParams = params = {

};

var entityOptions;
var engine;

var query = window.location.hash.substring(1);
var params = populateFromParams();

function populateFromParams() {
  params = _.clone(defaultParams);

  query.split('&').forEach(function(p) {
    p = p.split('=');
    params[p[0]] = parseFloat(p[1] || 0, 10);
  });

  return params;
}

function defaultPreUpdate(delta) {
  this.time = (this.time + (delta / 500)) % 6.2832;
}

function defaultUpdateXPos(delta) {
  this.pos.x += delta / 1000;
}

function updateEntityOptions() {
  entityOptions = {
    engine: engine,
    radius: .1,
    preUpdate: defaultPreUpdate,
    updateXPos: defaultUpdateXPos
  };
}

function addEntity(options) {
  options = options || {};

  engine.addEntity(
    new BaseBoid(Object.assign(
      {},
      entityOptions,
      options
    ))
  );
}

function updateParams() {
  var res = '';

  for (var prop in params) {
    if (params.hasOwnProperty(prop)) {
      res += '&' + prop + '=' + params[prop];
    }
  }

  window.location.hash = res.substring(0);
}

var width = $('body').width();
var height = $('body').height();

engine = new Engine(
  '.fk-canvas',
  width, height,
  6.28319 * 4, 8,
  {
    trackFPS: true,
    displayFPS: $('.fk-fps')
  }
);

updateEntityOptions();

// addEntity({
//   updateYPos: function(delta) {
//     this.pos.y = 0;
//   },
//   fill: "#444444"
// });

engine.addEntity(
  new DualOrbs({ engine })
);

// engine.addEntity(
//   new Serpent({ engine })
// );

// addEntity({
//   updateYPos: function(delta) {
//     this.pos.y = eval("Math.round(Math.sin(this.time) * 10) / 10");
//   },
//   fill: "#ff00ff"
// });
//
// addEntity({
//   updateYPos: function(delta) {
//     this.pos.y = Math.sin(this.time);
//   },
//   fill: "#333333"
// });

// addEntity({
//   updateYPos: function(delta) {
//     this.pos.y = Math.round(Math.sin(this.time));
//   },
//   fill: "#cccc00"
// });
//
// addEntity({
//   updateYPos: function(delta) {
//     this.pos.y = -1 * Math.abs(Math.sin(this.time));
//   },
//   fill: "#444400"
// });

engine.start();

$('.fk-stop').on('click', engine.stop.bind(engine));
$('.fk-start').on('click', engine.start.bind(engine));
$(".formula").on("change", _.debounce(function(e) {
  let newFormula = e.target.value || "";
  newFormula = newFormula.replace(
    /([\( ]?)(x|y)([ \)]?)|x/ig,
    function(match, r, v, l) {
      return `${r}this.pos.${v}${l}`;
    }
  );

  engine.entities[0].updateYPos = (function(delta) {
    this.pos.y = eval(newFormula)
  }).bind(engine.entities[0]);
}, 100));

$(".formula").keydown(e => e.stopImmediatePropagation());
