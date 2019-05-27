import _ from 'lodash';
import $ from 'jquery';
import * as d3 from 'd3';
import { Point, TwoEngine, Generator } from "2d-engine";

import PlanetEntity from './PlanetEntity';

export default class UniverseEngine extends TwoEngine {
  constructor(canvasClass, pixelX, pixelY, worldX, worldY, options) {
    super(canvasClass, pixelX, pixelY, worldX, worldY, options);

    this.GEE = 0.000003;

    this.yPrime = 1800;/// * .66;
    this.xPrime = this.xScale.domain()[1] * this.yPrime / this.yScale.domain()[1]; //* .66;

    this.xOffset = (this.xScale.domain()[1] - this.xPrime) / 2;
    this.yOffset = (this.yScale.domain()[1] - this.yPrime) / 2;
    this.created = 0;
    this.removed = 0;
    this.totalTime = 0;
    this.flung = 0;
    this.dragPointer = undefined;
    this.dragStart = undefined;

    this.offset = this.canvas.renderer.domElement.getBoundingClientRect();

    window.__ENTITIES__ = this.entities;

    this.generatorOptions = {
      multi: function(xStart, yStart, xHeading, yHeading) {
        var context = this;

        return {
          rate: 100,
          chance: .66,
          total: 100,
          generator: () => {
            this.generate({
              useOffset: false,
              xPos: xStart,
              yPos: yStart,
              headingX: xHeading * (1 + Generator.random(-.1, .1, 5)),
              headingY: yHeading * (1 + Generator.random(-.1, .1, 5)),
              density: Generator.random(5, 100, 2),
              mass: Math.random() < .1 ? Generator.random(500000, 1000000, 0) : Generator.random(50, 2500, 0),
              engine: context
            });
          }
        };
      },

      small: function(xStart, yStart, xHeading, yHeading) {
        var context = this;

        return {
          rate: 100,
          chance: .9,
          total: 250,
          generator: () => {
            this.generate({
              useOffset: false,
              xPos: xStart,
              yPos: yStart,
              headingX: xHeading * (1 + Generator.random(-.1, .1, 5)),
              headingY: yHeading * (1 + Generator.random(-.1, .1, 5)),
              density: Generator.random(10, 25, 2),
              mass: Generator.random(100, 500, 0),
              engine: context
            });
          }
        };
      },

      massive: function(xStart, yStart, xHeading, yHeading) {
        var context = this;

        return {
          rate: 100,
          chance: 1,
          total: 1,
          generator: () => {
            this.generate({
              useOffset: false,
              xPos: xStart,
              yPos: yStart,
              headingX: xHeading * (1 + Generator.random(-.1, .1, 5)),
              headingY: yHeading * (1 + Generator.random(-.1, .1, 5)),
              density: 100000,
              mass: 50000000,
              engine: context
            });
          }
        };
      }
    };

    this.currGeneratorOptions = this.generatorOptions.multi;

    d3.select(canvasClass).call(
      d3.drag()
        .on('start', () => {
          if (this.currGeneratorOptions) {
            this.dragging = true;

            const eX = d3.event.x - this.offset.x;
            const eY = d3.event.y + this.offset.y;

            this.dragStart = this.canvas.makeCircle(
              eX,
              eY,
              this.scale(15)
            );

            this.dragStart.noStroke();

            this.dragPointer = this.canvas.makeCircle(
              eX,
              eY,
              this.scale(30)
            );

            this.dragPointer.noStroke();

            this.dragLine = this.canvas.makeLine(
              eX,
              eY,
              eX,
              eY
            );

            this.dragLine.linewidth = this.scale(5);
            this.dragLine.stroke = '#00ff00';
            this.dragLine.fill = '#ff00ff';
          }
        })
        .on('drag', (drag) => {
          if (this.dragging) {
            const eX = d3.event.x - this.offset.x;
            const eY = d3.event.y + this.offset.y;

            this.dragPointer.translation.set(eX, eY);
            this.dragLine.vertices[1].set(
              eX - this.dragLine.translation.x,
              eY - this.dragLine.translation.y
            );
          }
        })
        .on('end', () => {
          if (this.dragging) {
            const xStart = this.xScale.invert(this.dragStart.translation.x);
            const yStart = this.yScale.invert(this.dragStart.translation.y);
            const tempVector = this.dragPointer.translation.set(
              this.xScale.invert(this.dragPointer.translation.x),
              this.yScale.invert(this.dragPointer.translation.y)
            );
            const tempVector2 = this.dragStart.translation.set(
              this.xScale.invert(this.dragStart.translation.x),
              this.yScale.invert(this.dragStart.translation.y)
            );

            tempVector.subSelf(tempVector2).divideScalar(1000);

            const xHeading = tempVector.x;
            const yHeading = tempVector.y;

            this.addGenerator(
              new Generator(this.currGeneratorOptions(xStart, yStart, xHeading, yHeading))
            );

            this.dragPointer.remove();
            this.dragStart.remove();
            this.dragLine.remove();

            this.emit('generator:clear');

            this.currGeneratorOptions = undefined;
            this.dragging = false;
          }
        })
    );

    this.defaultGeneratorOptions = () => {
      return {
        useOffset: true,
        xPos: 3 * this.xPrime / 8,
        yPos: this.yPrime / 2,
        mass: 1000 + ((Math.random() * 250) - 125),
        headingX: 0,
        headingY: 0,
        density: 10 + Math.floor(Math.random() * 100) / 10
      };
    };
  }

  process(delta) {
    this.totalTime += this.delta;

    if (!this.running) {
      return;
    }

    if (
      this.entities.length < 400
      // (this.entities.length < 500 && this.totalTime < 1200000) ||
      // (this.entities.length < 50)
    ) {
      if (!this.allGeneratorsEnabled()) {
        this.enableAllGenerators();
      }
    } else {
      this.disableAllGenerators();
    }

    _.each(this.enabledGenerators, (g) => {
      g.generate(delta);
    });

    _.each(this.entities, (entity) => {
      entity.calculate(this.delta);
    });

    _.each(this.entities, (entity, index) => {
      entity && this.processEntity(entity, index);
    });

    this.updateStats();

    this.liveTrackFPS(delta);
  }

  generate(options) {
    options = _.defaults(
      options, this.defaultGeneratorOptions()
    );

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
      headingY: options.headingY,
      engine: this
    });

    entity.entities = this.entities;
    entity.engine = this;

    this.addEntity(entity);
  }

  addEntity(entity) {
    entity.entities = this.entities;
    entity.engine = this;

    return super.addEntity(entity);
  }

  removeEntity(entity) {
    super.removeEntity(entity);

    this.removed++;
    this.updateStats();
  }

  setGenerator(type) {
    this.emit('generator:clear');

    if (this.generatorOptions[type]) {
      this.currGeneratorOptions = this.generatorOptions[type];
    }
  }

  updateStats() {
    $('.stats').text('Created: ' + this.created + ' - Active: ' + this.entities.length + ' - Removed: ' + this.removed + ' - Flung: ' + this.flung);
  }
};
