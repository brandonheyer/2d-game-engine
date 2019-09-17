import Point from './Point';
import Vector from './Vector';
import Events from 'event-pubsub';

/**
 * A BaseEntity is a individual item that should be updated and
 * rendered as the engine runs.
 */
export default class BaseEntity {
  /**
   * Create the entity
   */
  constructor(options) {
    options = options || {};

    this.events = new Events();
    this.on = this.events.on.bind(this.events);
    this.off = this.events.off.bind(this.events);
    this.emit = this.events.emit.bind(this.events);

    options.engine && this.setScales(options.engine);

    this.speed = 0;
    this.heading = new Vector(0, 0);

    // Store or create the starting position
    this.pos = options.startingPosition || this.startingPosition();
  }

  /**
   * Store the scales from the engine onto the entity
   */
  setScales(engine) {
    this.scale = engine.scale;
    this.xScale = engine.xScale;
    this.yScale = engine.yScale;

    if (this.xScale) {
      this.xMax = this.xScale.domain()[1];
    } else {
      this.xMax = 0;
    }

    if (this.yScale) {
      this.yMax = this.yScale.domain()[1];
    } else {
      this.yMax = 0;
    }
  }

  /**
   * Called when the entity is removed
   */
  destroy() {
    this.element.remove();
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

    this.element
      .attr('transform', 'translate(' + this.xScale(this.pos.x) + ',' + this.yScale(this.pos.y) + ')');
  }

  /**
   * The render method is called when the entity is initially added
   * any core properties or svg display should be set up here
   */
  render() {
    this.element = undefined;
  }

  translate(x, y, element = this.element) {
    element.translation.set(
      this.xScale(x),
      this.yScale(y)
    );
  }

  translateByPoint(point, element = this.element) {
    element.translation.set(
      this.xScale(point.x),
      this.yScale(point.y)
    );
  }
};
