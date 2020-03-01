import Events from "event-pubsub";
import random from "random";
import seedrandom from "seedrandom";

import Point from "./Point";
import Vector from "./Vector";

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

    this.initializeProperties(options);
  }

  initializeProperties(options) {
    options = options || {};

    this.engine = options.engine;
    this.renderMethod = options.render;
    this.speed = options.speed || 1;
    this.heading = new Vector(0, 0);

    if (this.engine) {
      this.setScales(options.engine);
      this.entities = this.engine.entities;
    }

    this.pos = this.startingPosition(options);

    if (options.initialize) {
      options.initialize.call(this);
    }

    if (options.update === "advanced") {
      this.update = this.updateAdvanced;

      this.tempVector = new Vector(0, 0);
      this.normalizedVector = new Vector(0, 0);
      this.magnitude = 0;
      this.magnitudeSq = 0;
      this.minDistance = 0;
      this.minDistanceSq = 0;
    }
    else {
      this.update = this.updateBasic;
    }
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
  startingPosition(options) {
    if (typeof(options.startingPosition) === "function") {
      return options.startingPosition.call(this);
    }

    if (options.startingPosition) {
      return options.startingPosition;
    }

    if (options.randomStart) {
      return new Point(
        this.engine.randomXPos(),
        this.engine.randomYPos()
      );
    }

    return new Point(0, 0);
  }

  /**
   * Is overridden with  correct type of update method via options.update
   */
  update() {}

  /**
   * The update cycle is called every tick of the engine, any
   * properties of the entity should be updated in this method
   *
   * @param  {Number} delta - time since last update in ms
   */
  updateBasic(delta) {
    this.updatePosition(delta);

    this.element.translation.set(
      this.xScale(this.pos.x),
      this.yScale(this.pos.y)
    );
  }

  updateAdvanced(delta) {
    for (let i = 0; i < this.entities.length; i++) {
      if (this.index !== i) {
        this.updateWithOther(delta, this.entities[i]);
      }
    }

    this.preUpdatePosition(delta);
    this.updatePosition(delta);
    this.postUpdatePosition(delta);
  }

  updateWithOther(delta, other) {
    this.tempVector.x = other.pos.x - this.pos.x;
    this.tempVector.y = other.pos.y - this.pos.y;

    this.magnitudeSq = this.tempVector.magnitudeSq();
    this.minDistance = this.radius + other.radius;
    this.minDistanceSq = this.minDistance * this.minDistance;

    if (this.magnitudeSq < this.minDistanceSq) {
      this.magnitude = Math.sqrt(this.magnitudeSq);

      this.normalizedVector.x = this.tempVector.x / this.magnitude;
      this.normalizedVector.y = this.tempVector.y / this.magnitude;

      other.onCollision(this, this.normalizedVector, this.magnitude);
    }
  }

  preUpdatePosition() {}

  updatePosition(delta) {
    this.pos.scalePlusEquals(this.speed * delta, this.heading);
  }

  postUpdatePosition() {
    this.translate(this.pos.x, this.pos.y);
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
}
