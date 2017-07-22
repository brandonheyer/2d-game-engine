import * as d3 from 'd3';
import Vector from './Vector';
import Point from './Point';

/**
 * A BaseEntity is a individual item that should be updated and
 * rendered as the engine runs.
 */
class BaseEntity {
  /**
   * Create the entity
   */
  constructor(options) {
    this.xScale = options.xScale;
    this.yScale = options.yScale;

    this.xMax = this.xScale.domain()[1];
    this.yMax = this.yScale.domain()[1];

    // Store or create the starting position
    this.pos = options.startingPosition || this.startingPosition();
  }

  /**
   * Create a starting point for the entity
   * Can be overridden in extending classes to add functionality
   */
  startingPosition() {
    return new Point(0, 0);
  }

  /**
   * The update cycle is called every tick of the engine, any
   * properties of the entity should be updated in this method
   *
   * @param  {Number} delta - time since last update in ms
   */
  update(delta) {
    this.pos.scalePlusEquals(this.speed * delta, this.heading);

    this.pos.x = (this.pos.x + this.xMax) % this.xMax;
    this.pos.y = (this.pos.y + this.yMax) % this.yMax;
    );
  }

  /**
   * The render method is called when the entity is initially added
   * any core properties or svg display should be set up here
   *
   * @param  {d3.selection} canvas The d3 selection of the engines main display canvas
   */
  render(canvas) {
    return el;
  }
}

export default BaseEntity;
