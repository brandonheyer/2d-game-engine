import _ from "lodash";
import $ from "jquery";

import {Point} from "2d-engine";

import Engine from "./engine/Engine";
import DualOrbs from "./entities/DualOrbs";
import Serpent from "./entities/Serpent";
import Penta from "./entities/Penta";

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

const width = 1400;
const height = 850;

updateEntityOptions();

window.preTransition = () => {
  if (engine) {
    engine.clear();
    engine.canvas.remove();
  }
};

function addAnimatedHeader(content, section, tag = "h2") {
  const h = $(`<${tag}>${content}</${tag}>`)
    .css({ opacity: 0 })
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
          speed: 750,
          radius: .3
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
          speed: 500,
          radius: .4
        })
      ],
      Math.PI * 4,
      3
    )
  ],

  // round(sin)
  [
    (section) => addAnimatedHeader("y = rnd(sin(x))", section),
    () => makeEngine(() =>
      [
        makeOrb({
          preUpdatePosition: function() {
            this.pos.y = Math.round(Math.sin(this.pos.x))
          },
          speed: 500,
          radius: .4
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
    6
  ),

  () => makeEngine(() => {
    const eye1 = makeOrb({
        preUpdatePosition: function(delta) {
          this.pos.y = -1 * (2 + Math.sin(this.pos.x + Math.PI / 2) - 1);
        },
        startingPosition: (new Point(Math.PI / 2, 1)),
        speed: 400,
        radius: .4,
        trace: false
      });

    const eye2 = makeOrb({
        preUpdatePosition: function(delta) {
          this.pos.y = -1 * (2 + Math.sin(this.pos.x + (4 * Math.PI - (Math.PI / 2))) - 1);
        },
        startingPosition: (new Point(4 * Math.PI - (Math.PI / 2), 1)),
        speed: 400,
        radius: .4,
        trace: false
      });

    return [
      new Penta({
        closed: true,
        engine
      }),
      eye1,
      eye2
    ];
  }, Math.PI * 16, 10)
];
