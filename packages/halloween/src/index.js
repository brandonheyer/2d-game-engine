import _ from "lodash";
import $ from "jquery";

import {Point} from "2d-engine";

import Engine from "./engine/Engine";
import Tracer from "./entities/Tracer";
import DualOrbs from "./entities/DualOrbs";
import Serpent from "./entities/Serpent";

import BaseOrb from "./entities/BaseOrb";

var entityOptions;
var engine;

function defaultPreUpdate(delta) {
  this.totalTime += delta / this.moveSlow;

  if (this.totalTime > (6.2832 + this.radius) * 1.05) {
    this.totalTime = -1 * this.radius * 1.05;
  }

  this.time = this.totalTime % 6.2832;
}

function defaultUpdateXPos(delta) {
  this.pos.x = this.totalTime;
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
    new Tracer(Object.assign(
      {},
      entityOptions,
      options
    ))
  );
}

const width = 1400;
const height = 780;

updateEntityOptions();

window.preTransition = () => {
  if (engine) {
    engine.clear();
    engine.canvas.remove();
  }
};

function addAnimatedHeader(content, section, tag = "h2") {
  const h = $(`<${tag}>${content}</${tag}>`)
    .css({ opacity: 1 })
    .appendTo(section);

  setTimeout(() => h.animate({ opacity : 1 }));
}

function makeEngine(entities, engineWidth = Math.PI, engineHeight = 1) {
  engine = new Engine(
    '.fk-canvas',
    width,
    height,
    engineWidth,
    engineHeight
  );

  entities().forEach(e => engine.addEntity(e));

  engine.start();
}

function makeOrb(options) {
  return new BaseOrb(
    Object.assign(
      {
        engine,
        radius: .2,
        speed: 1000
      },
      options
    )
  );
}

const steps = window.steps = [
  // Intro
  [
    () => {},
    (section) => {
      addAnimatedHeader("ARCANE ANIMATION:", section, "h1");
      addAnimatedHeader("<span>The</span> Sinister Sine", section);
    }
  ],

  // Straight Line
  [
    (section) => {
      addAnimatedHeader("x-axis is time", section);
    },
    (section) => {
      addAnimatedHeader("x = x + &Delta;", section);
      addAnimatedHeader("y = 0", section);
    },
    () => makeEngine(() => [
      makeOrb({
        preUpdatePosition: function() { this.pos.y = 0 }
      })
    ])
  ],

  // With 1 Sine Wave
  [
    (section) => addAnimatedHeader("y = sin(x)", section),
    () => makeEngine(() =>
      [
        makeOrb({
          preUpdatePosition: function() {
            this.pos.y = Math.sin(this.pos.x);
          },
          speed: 500
        })
      ],
      2 * Math.PI,
      3
    )
  ],

  // abs(sin)
  [
    (section) => addAnimatedHeader("y = |sin(x)|", section),
    () => makeEngine(() =>
      [
        makeOrb({
          preUpdatePosition: function() {
            this.pos.y = -1 * Math.abs(Math.sin(this.pos.x))
          },
          speed: 500
        })
      ],
      Math.PI * 4,
      3
    )
  ],

  [
    (section) => {
      addAnimatedHeader("y  = sin(x)", section, "h3");
      addAnimatedHeader("y  = sin(2x)", section, "h3");
      addAnimatedHeader("y  = sin(3x)", section, "h3");
    },
    () => makeEngine(() =>
      [
        makeOrb({
          preUpdatePosition: function() {
            this.pos.y = Math.sin(this.pos.x);
          },
          radius: .15,
          speed: 1000
        }),
        makeOrb({
          preUpdatePosition: function() {
            this.pos.y = Math.sin(2 * this.pos.x);
          },
          radius: .15,
          speed: 1000
        }),
        makeOrb({
          preUpdatePosition: function() {
            this.pos.y = Math.sin(3 * this.pos.x);
          },
          radius: .15,
          speed: 1000
        })
      ],
      Math.PI * 2,
      3
    )
  ],

  // Sine and -Sine
  [
    (section) => {
      addAnimatedHeader("y = sin(x)", section);
      addAnimatedHeader("y = -sin(x)", section);
    },
    () => makeEngine(() =>
      [
        makeOrb({
          preUpdatePosition: function(delta) {
            this.pos.y = Math.sin(this.pos.x);
          },
          radius: .15
        }),
        makeOrb({
          preUpdatePosition: function(delta) {
            this.pos.y = -1 * Math.sin(this.pos.x);
          },
          radius: .15
        })
      ],
      Math.PI * 2,
      3
    )
  ],

  () => makeEngine(() =>
    [
      new DualOrbs({ engine })
    ],
    Math.PI * 6,
    8
  ),

  () => makeEngine(() =>
    [
      new Serpent({ engine })
    ],
    Math.PI * 6,
    8
  ),
];




// addEntity({
//   updateYPos: function(delta) {
//     this.pos.y = eval("Math.round(Math.sin(this.time) * 10) / 10");
//   },
//   fill: "#ff00ff"
// });
//
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
//
// $(".formula").on("change", _.debounce(function(e) {
//   let newFormula = e.target.value || "";
//   newFormula = newFormula.replace(
//     /([\( ]?)(x|y)([ \)]?)|x/ig,
//     function(match, r, v, l) {
//       return `${r}this.pos.${v}${l}`;
//     }
//   );
//
//   engine.entities[0].updateYPos = (function(delta) {
//     this.pos.y = eval(newFormula)
//   }).bind(engine.entities[0]);
// }, 100));
//
// $(".formula").keydown(e => e.stopImmediatePropagation());
