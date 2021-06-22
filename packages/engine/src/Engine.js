import random from "random";
import seedrandom from "seedrandom";
import $ from 'jquery';
import * as d3 from 'd3';
import _ from 'lodash';
import Events from 'event-pubsub';

const SUPPORT_OFFSET = window.pageYOffset !== undefined;

/**
 * An engine is the workhorse for the 2d game engine
 */
export default class Engine {
  constructor(canvasClass, pixelX, pixelY, worldX, worldY, options) {
    this.options = options = options || {};

    this.events = new Events();
    this.on = this.events.on.bind(this.events);
    this.off = this.events.off.bind(this.events);
    this.emit = this.events.emit.bind(this.events);
    this.zoom = this.zoom.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.zoomIn = this.zoomIn.bind(this);

    this.initializeCanvas(canvasClass, pixelX, pixelY, options);

    this.body = $('body');

    this.zoomEnabled = true;

    // this.zoom = 1;
    this.speedMultiplier = 1;

    this.xMax = worldX;
    this.yMax = worldY;
    this.xOffset = 0;
    this.yOffset = 0;

    this.xScale = d3.scaleLinear()
      .domain([0, worldX])
      .range([0, pixelX]);

    this.yScale = d3.scaleLinear()
      .domain([0, worldY])
      .range([0, pixelY]);

    this.scale = d3.scaleLinear()
      .domain([0, worldX])
      .range([0, pixelX]);

    this.entities = [];
    this.generators = [];
    this.enabledGenerators = [];

    this.timeout = undefined;
    this.last = undefined;

    // Only track fps if requested
    if (options.trackFPS) {
      this.liveTrackFPS = this.trackFPS;

      this.frames = 0;
      this.currFrames = 0;
      this.frameTimes = [];
      this.frameTimes.length = 100;
      this.frameTimes.fill(0);

      if (options.displayFPS) {
        this.displayFPS = options.displayFPS;
      } else {
        this.displayFPS = {
          text: function() {}
        };
      }
    } else {
      this.liveTrackFPS = function() {};
    }

    this.randomXPos = random.clone(seedrandom("bounce-pos-x"))
      .uniformInt(0, this.xMax);

    this.randomYPos = random.clone(seedrandom("bounce-pos-y"))
      .uniformInt(0, this.yMax);

    this.initializeKeyboardEvents();
    this.initializeScroll();
  }

  initializeKeyboardEvents() {
    $('body').keydown((e) => {
      let xDomain = this.xScale.domain();
      let yDomain = this.yScale.domain();
      let xPos = 0;
      let yPos = 0;

      const meta = e.metaKey || e.ctrlKey;

      switch(e.keyCode) {
        case 65:
          xPos = this.xMax * -.05;
          break;

        case 68:
          xPos = this.xMax * .05;
          break;

        case 83:
          yPos = this.yMax * -.05;
          break;

        case 87:
          yPos = this.yMax * .05;
          break;

        case 187:
          if (meta) {
            this.zoomIn();
          }
          break;

        case 189:
          if (meta) {
            this.zoomOut();
          }
          break;

        default:
          return;
      }

      e.preventDefault();
      e.stopImmediatePropagation();

      if (xPos || yPos) {
        this.xOffset = this.xOffset + xPos;
        this.yOffset = this.yOffset + yPos;

        this.canvas.scene.translation.set(
          this.xScale(this.xOffset),
          this.yScale(this.yOffset)
        );
      }

      // this.xScale.domain([xDomain[0] + xPos, xDomain[1] + xPos]);
      // this.yScale.domain([yDomain[0] + yPos, yDomain[1] + yPos]);
    });
  }

  /**
   * Initializes the drawing canvas
   *
   * @param  {[type]} canvasClass [description]
   * @param  {[type]} pixelX      [description]
   * @param  {[type]} pixelY      [description]
   * @param  {[type]} options     [description]
   */
  initializeCanvas() {
    return;
  }

  addGenerator(generator) {
    this.generators.push(generator);

    if (generator.enabled) {
      this.enabledGenerators.push(generator);
    }
  }

  allGeneratorsEnabled() {
    return this.generators.length && this.enabledGenerators.length === this.generators.length;
  }

  enableAllGenerators() {
    this.enabledGenerators = _.map(this.generators, (g) => {
      return g.enable();
    });
  }

  disableAllGenerators() {
    _.each(this.enabledGenerators, (g) => {
      g.disable();
    });

    this.enabledGenerators = [];
  }

  /**
   * Add an entity to the engine
   */
  addEntity(entity) {
    this.entities.push(entity);
    entity.engine = this;

    this.emit('entities:change', this.entities.length);

    if (!entity.xScale && !entity.yScale) {
      entity.setScales(this);
    }
  }

  /**
   * Remove an entity from the engine
   */
  removeEntity(entity) {
    var index = this.entities.indexOf(entity);

    this.emit('entities:change', this.entities.length);

    if (index !== -1) {
      this.removeEntityAt(index);
    }
  }

  removeAllEntities() {
    _.each(this.entities, (e) => {
      e.destroy();
    });

    this.entities = [];
  }

  /**
   * Remove the entity at the specific index
   */
  removeEntityAt(index) {
    this.entities[index].destroy();
    this.entities.splice(index, 1);
  }

  /**
   * Call update on the entity
   */
  processEntity(entity) {
    entity.update(this.delta);
  }

  trackFPS(delta) {
    this.frameTimes[this.frames % 100] = delta;
    this.frames++;
    this.average = Math.round(1 / (_.mean(this.frameTimes) / 1000), 2);

    this.displayFPS.text(this.average);
  }

  /**
   * Process gets called every tick
   */
  process(delta) {
    this.liveTrackFPS(delta);

    this.enabledGenerators = _.filter(this.generators, { enabled: true });
    _.each(this.enabledGenerators, (g) => {
      g.generate(delta);
    });
  }

  setSpeedMultiplier(value) {
    value = parseInt(value);

    if (value) {
      this.speedMultiplier = value;

      if (!this.running) {
        this.start();
      }
    }

    if (!value && this.running) {
      this.stop();
    }
  }

  /**
   * Run an iteration of the engine
   */
  tick() {
    var newLast = +(new Date());
    this.delta = ((newLast - this.last) * this.speedMultiplier) || 1;

    this.last = newLast;

    return this.delta;
  }

  /**
   * Start the engine
   */
  start() {
    this.last = +(new Date());
    this.running = true;
  }

  /**
   * Stop the engine
   */
  stop() {
    this.running = false;
  }

  clear() {
    this.stop();
    this.removeAllEntities();
  }

  zoom(xO, yO, xS, yS) {
    if (this.zoomEnabled) {
      let xDomain = this.xScale.domain();
      let yDomain = this.yScale.domain();
      let xScale = 1/16 * this.xMax * xS;
      let yScale = 1/16 * this.yMax * yS;
      let xPosRatio = xO / this.xScale.range()[1];
      let yPosRatio = yO / this.yScale.range()[1];

      this.xScale.domain([xDomain[0] + (xScale * xPosRatio), xDomain[1] - (xScale * (1 - xPosRatio))]);
      this.yScale.domain([yDomain[0] + (yScale * yPosRatio), yDomain[1] - (yScale * (1 - yPosRatio))]);
      this.scale.domain([0, this.xScale.domain()[1] - this.xScale.domain()[0]]);

      _.each(this.entities, (e) => {
        e.render(this.canvas);
      });
    }
  }

  zoomOut(offsetX = 0, offsetY = 0) {
    this.zoom(offsetX, offsetY, -1, -1);
  }

  zoomIn(offsetX = 0, offsetY = 0) {
    this.zoom(offsetX, offsetY, 1, 1);
  }

  handleScroll(e, up) {
    if (up) {
      this.zoomOut(e.offsetX, e.offsetY);
    }
    else {
      this.zoomIn(e.offsetX, e.offsetY);
    }
  }

  initializeScroll() {
    this.scrollStep = 16;
    window.addEventListener('wheel', (e) => {
      if (e.deltaY === 0) {
        return;
      }

      this.handleScroll(e, e.deltaY < 0);
    });
  }
};
