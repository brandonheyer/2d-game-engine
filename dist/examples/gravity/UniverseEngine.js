import _ from 'lodash';
import {Point, TwoEngine} from '2d-engine';
import PlanetEntity from './PlanetEntity';
import $ from 'jquery';

export default class UniverseEngine extends TwoEngine {
  constructor(canvasClass, pixelX, pixelY, worldX, worldY, options) {
    super(canvasClass, pixelX, pixelY, worldX, worldY, options);

    this.lastAsteroid = 0;
    this.lastTimeout = 100;

    this.yPrime = 1800;/// * .66;
    this.xPrime = this.xScale.domain()[1] * this.yPrime / this.yScale.domain()[1]; //* .66;

    this.xOffset = (this.xScale.domain()[1] - this.xPrime) / 2;
    this.yOffset = (this.yScale.domain()[1] - this.yPrime) / 2;
    this.created = 0;
    this.removed = 0;
    this.totalTime = 0;
    this.flung = 0;
  }

  process(delta) {
    this.liveTrackFPS(delta);
    this.totalTime += this.delta;
    this.lastAsteroid += this.delta;

    if (
      (this.entities.length < 500 && this.totalTime < 1200000 &&  this.lastAsteroid > this.lastTimeout) ||
      (this.entities.length < 50 && this.lastAsteroid > this.lastTimeout) ||
      this.lastAsteroid > 5000
    ) {
      let entity;
      let mass = 1000 + ((Math.random() * 250) - 125);
      let xPos = 3 * this.xPrime / 8;
      let yPos = this.yPrime / 2;
      let headingX = 0;
      let headingY = 0;
      let generator = Math.floor(Math.random() * 1000) / 10;
      let density = 10 + Math.floor(Math.random() * 100) / 10;

      if (!this.running) {
        return;
      }

      this.updateStats();

      this.lastAsteroid = 0;
      this.lastTimeout = (Math.random() * 5) + 1;

      if (generator <= 0) {
        xPos = this.xPrime / 2;
        yPos = (1/8 * this.yPrime) + ((Math.random() * (this.yPrime / 300)) - (this.yPrime / 600));
        headingX = 1.61 + ((Math.random() / 10) - .05);

      } else if (generator <= 0) {
        xPos = this.xPrime / 2;
        yPos = (7/8 * this.yPrime) + ((Math.random() * (this.yPrime / 300)) - (this.yPrime / 600));
        headingX = -1.61 - ((Math.random() / 10) - .05);

      } else if (generator <= 0) {
        xPos = (5/16 * this.xPrime) + ((Math.random() * (this.xPrime / 300)) - (this.xPrime / 600));
        headingY = -1.55 - ((Math.random() / 10) - .05);

      } else if (generator <= 0) {
        xPos = (11/16 * this.xPrime) - ((Math.random() * (this.xPrime / 300)) - (this.xPrime / 600));
        headingY = 1.55 + ((Math.random() / 10) - .05);

      } else if (generator <= 50) {
        xPos = (0) - ((Math.random() * (this.xPrime / 300)) - (this.xPrime / 600));
        // headingY = -.91 + ((Math.random() / 10) - .05);
        headingY = -1.21 + ((Math.random() / 10) - .05);
        density /= 1;
        mass *= 1;

      } else if (generator <= 100) {
        xPos = (this.xPrime) - ((Math.random() * (this.xPrime / 300)) - (this.xPrime / 600));
        // headingY = .91 + ((Math.random() / 10) - .05);
        headingY = 1.21 + ((Math.random() / 10) - .05);
        density /= 1;
        mass *= 1;

      } else if (generator <= 0) {
        xPos = (-3/8 * this.xPrime) - ((Math.random() * (this.xPrime / 300)) - (this.xPrime / 600));
        headingY = -.41 + ((Math.random() / 10) - .05);
        mass *= 50;
        density /= 25;

      } else {
        xPos = (11/8 * this.xPrime) - ((Math.random() * (this.xPrime / 300)) - (this.xPrime / 600));
        headingY = .41 + ((Math.random() / 10) - .05);
        mass *= 50;
        density /= 25;
      }

        // case 2:
        //   xPos = ((7 * this.xPrime) / 8) + ((Math.random() * (this.xPrime / 50)) - (this.xPrime / 100));
        //   headingY = -1.1 - ((Math.random() / 10) - .05);
        //   break;
        //
        // case 3:
        //   xPos = (this.xPrime / 8) - ((Math.random() * (this.xPrime / 50)) - (this.xPrime / 100));
        //   headingY = 1.1 + ((Math.random() / 10) - .05);
        //   break;

      // } else if (generator < 95) {
      //     xPos = ((13 * this.xPrime) / 32) - ((Math.random() * (this.xPrime / 50)) - (this.xPrime / 100));
      //     headingY = 16.28 + ((Math.random() / 10) - .05);
      //
      // } else {
      //   xPos = ((19 * this.xPrime) / 32) + ((Math.random() * (this.xPrime / 50)) - (this.xPrime / 100));
      //   headingY = -16.28 - ((Math.random() / 10) - .05);
      // }

        this.generate({
          useOffset: true,
          xPos: xPos,
          yPos: yPos,
          mass: mass,
          headingX: headingX,
          headingY: headingY,
          density: density
        })
    }

    _.each(this.entities, (entity) => {
      entity.calculate(this.delta);
    });

    _.each(this.entities, (entity) => {
      if (entity) {
        entity.update(this.delta);
      }
    });
  }

  generate(options) {
    options = options || {};

    this.created++;

    if (options.pos) {
      options.xPos = options.pos.x;
      options.yPos = options.pos.y;
    }

    if (options.heading) {
      options.headingX = options.heading.x;
      options.headingY = options.heading.y;
    }

    if (options.useOffset) {
      options.xPos += this.xOffset;
      options.yPos += this.yOffset;
    }

    let entity = new PlanetEntity({
      mass: options.mass,
      density: options.density,
      startingPosition: new Point(options.xPos, options.yPos),
      radius: options.radius || (options.mass * 6),
      headingX: options.headingX,
      headingY: options.headingY
    });

    entity.entities = this.entities;
    entity.engine = this;

    this.addEntity(entity);
  }

  removeEntity(entity) {
    super.removeEntity(entity);

    this.removed++;
    this.updateStats();
  }

  updateStats() {
    $('.stats').text('Created: ' + this.created + ' - Active: ' + this.entities.length + ' - Removed: ' + this.removed + ' - Flung: ' + this.flung);
  }
}
