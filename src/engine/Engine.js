import * as d3 from 'd3';
import Vector from './Vector';

/**
 * An engine is the workhorse for the 2d game engine
 */
class Engine {
  constructor(svgClass, pixelX, pixelY, worldX, worldY) {
    this.svg = d3.select(svgClass)
      .attr('width', pixelX)
      .attr('height', pixelY);

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
  }

  /**
   * Add an entity to the engine
   */
  addEntity(entity) {
    this.entities.push(entity);
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
 * Preprocess the entity, this primarily makes sure the selection is up to
 * date in cases where the entity has been removed and replaced with a new one
 */
  preProcessEntity(d3Element, entity, index) {
    if (!entity.element || entity.element._groups[0][0] !== d3Element) {
      entity.element = d3.select(d3Element);
    }

    this.processEntity(entity, index);
  }

  /**
   * Call update on the entity
   */
  processEntity(entity, index) {
    entity.update(this.delta);
  }

  /**
   * Process gets called every tick
   */
  process(delta) {
    var context = this;

    this.elements.each(function(entity, index) {
      context.preProcessEntity(this, entity, index);
    });
  }

  /**
   * Handle new elements coming in with D3
   */
  enterElements() {
    this.elements.enter()
      .append('g')
      .attr('class', 'entity')
      .each(function(d) {
        d.render(
          d3.select(this)
        );
      });
  }

  /**
   * Handle elements exiting with D3
   */
  exitElements() {
    this.elements.exit()
      .each(function(d) {
        d.destroy();
      });
  }

  /**
   * Run an iteration of the engine
   */
  tick() {
    var newLast = +(new Date());
    var delta = this.delta = newLast - this.last;

    this.last = newLast;

    this.elements = this.svg.selectAll('g.entity')
      .data(this.entities);

    this.enterElements();
    this.exitElements();

    this.elements = this.svg.selectAll('g.entity');

    this.process(delta);

    this.timeout = setTimeout(this.tick.bind(this));
  }

  /**
   * Start the engine
   */
  start() {
    if (!this.timeout) {
      this.last = +(new Date());

      this.timeout = setTimeout(this.tick.bind(this));
    }
  }

  /**
   * Stop the engine
   */
  stop() {
    clearTimeout(this.timeout);

    this.timeout = undefined;
  }
}

export default Engine;
