import * as d3 from 'd3';
import _ from 'lodash';

import Engine from './Engine';

/**
 * An engine is the workhorse for the 2d game engine
 */
class SVGEngine extends Engine {
  initializeCanvas(canvasClass, pixelX, pixelY, options) {
    this.svg = d3.select(canvasClass)
      .attr('width', pixelX)
      .attr('height', pixelY);

    if (_.isFunction(_.get(options, 'events.click'))) {
      this.svg.on('click', options.events.click);
    }
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
   * Process gets called every tick
   */
  process(delta) {
    var context = this;

    super.process(delta);

    this.elements.each(function(entity, index) {
      // Preprocess sending d3 element as first param
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
    var delta = super.tick();

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
      super.start();

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

export default SVGEngine;
