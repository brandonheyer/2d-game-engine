import _ from 'lodash';
import * as d3 from 'd3';
import {Vector, TwoEngine} from '2d-engine';

class Engine extends TwoEngine {
  constructor(svgClass, pixelX, pixelY, worldX, worldY, options) {
    super(svgClass, pixelX, pixelY, worldX, worldY, options || {
      trackFPS: function() {}
    });

    options = options || {};

    this.zoomEnabled = false;
  }
}

export default Engine;
