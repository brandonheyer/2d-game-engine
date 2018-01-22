import * as d3 from 'd3';
import _ from 'lodash';

/**
 * An engine is the workhorse for the 2d game engine
 */
class Engine {
  constructor(canvasClass, pixelX, pixelY, worldX, worldY, options) {
    options = options || {};

    this.initializeCanvas(canvasClass, pixelX, pixelY, options);

    this.xMax = worldX;
    this.yMax = worldY;

    this.xScale = d3.scaleLinear()
      .domain([0, worldX])
      .range([0, pixelX]);

    this.yScale = d3.scaleLinear()
      .domain([0, worldY])
      .range([0, pixelY]);

    this.entities = [];

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

  /**
   * Add an entity to the engine
   */
  addEntity(entity) {
    this.entities.push(entity);

    if (!entity.xScale && !entity.yScale) {
      entity.setScales(this);
    }
  }

  /**
   * Remove an entity from the engine
   */
  removeEntity(entity) {
    var index = this.entities.indexOf(entity);

    if (index !== -1) {
      this.removeEntityAt(index);
    }
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
  }

  /**
   * Run an iteration of the engine
   */
  tick() {
    var newLast = +(new Date());
    var delta = this.delta = newLast - this.last;

    this.last = newLast;

    return delta;
  }

  /**
   * Start the engine
   */
  start() {
    this.last = +(new Date());
  }

  /**
   * Stop the engine
   */
  stop() {

  }
}

export default Engine;
