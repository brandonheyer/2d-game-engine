import * as d3 from 'd3';

/**
 * Work in progress
 */
export default class BaseGrid {
  constructor(options) {
    this.xScale = d3.scaleLinear()
      .domain(0, options.gridX)
      .range(options.engine.xScale.domain());

    this.yScale = d3.scaleLinear()
      .domain(0, options.gridY)
      .range(options.engine.yScale.domain());

    this.grid = [];
    this.grid.length = options.gridY;

    this.grid.foreach((g) => {
      g = [];
      g.length = options.gridX;
    });
  }
};
