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
    options = options || {};

    this.events = new Events();
    this.on = this.events.on.bind(this.events);
    this.off = this.events.off.bind(this.events);
    this.emit = this.events.emit.bind(this.events);

    this.initializeCanvas(canvasClass, pixelX, pixelY, options);

    this.body = $('body');

    this.zoom = 1;
    this.speedMultiplier = 1;

    this.xMax = worldX;
    this.yMax = worldY;


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

    this.ticks = 0;

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

    this.initializeKeyboardEvents();
    this.initializeScroll();
  }

  initializeKeyboardEvents() {
    $('body').keydown((e) => {
      let xDomain = this.xScale.domain();
      let yDomain = this.yScale.domain();
      let xPos = 0;
      let yPos = 0;

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
      }

      this.xScale.domain([xDomain[0] + xPos, xDomain[1] + xPos]);
      this.yScale.domain([yDomain[0] + yPos, yDomain[1] + yPos]);
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
    var delta = this.delta = (newLast - this.last) * this.speedMultiplier;

    this.last = newLast;

    return delta;
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

  handleScroll(e, up) {
    let xDomain = this.xScale.domain();
    let yDomain = this.yScale.domain();
    let xScale = 1/16 * this.xMax;
    let yScale = 1/16 * this.yMax;
    let xPosRatio = e.offsetX / this.xScale.range()[1];
    let yPosRatio = e.offsetY / this.yScale.range()[1];

    if (up) {
      xScale *= -1;
      yScale *= -1;
    }

    this.xScale.domain([xDomain[0] + (xScale * xPosRatio), xDomain[1] - (xScale * (1 - xPosRatio))]);
    this.yScale.domain([yDomain[0] + (yScale * yPosRatio), yDomain[1] - (yScale * (1 - yPosRatio))]);
    this.scale.domain([0, this.xScale.domain()[1] - this.xScale.domain()[0]]);

    _.each(this.entities, (e) => {
      e.render();
    });
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
