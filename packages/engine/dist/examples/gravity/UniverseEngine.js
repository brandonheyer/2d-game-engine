import _ from 'lodash';
import {Point, TwoEngine, Generator} from '2d-engine';
import PlanetEntity from './PlanetEntity';
import $ from 'jquery';
import * as d3 from 'd3';

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
    this.dragPointer = undefined;
    this.dragStat = undefined;

    d3.select(canvasClass).call(
      d3.drag()
        .on('start', () => {
          this.dragStart = this.canvas.makeCircle(
            d3.event.x,
            d3.event.y,
            this.scale(15)
          );

          this.dragStart.noStroke();

          this.dragPointer = this.canvas.makeCircle(
            d3.event.x,
            d3.event.y,
            this.scale(30)
          );

          this.dragPointer.noStroke();

          this.dragLine = this.canvas.makeLine(
            d3.event.x,
            d3.event.y,
            d3.event.x,
            d3.event.y
          );

          this.dragLine.linewidth = this.scale(5);
          this.dragLine.stroke = '#00ff00';
          this.dragLine.fill = '#ff00ff';
        })
        .on('drag', (drag) => {
          this.dragPointer.translation.set(d3.event.x, d3.event.y);
          this.dragLine.vertices[1].set(
            d3.event.x - this.dragLine.translation.x,
            d3.event.y - this.dragLine.translation.y
          );
        })
        .on('end', () => {
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
            new Generator({
              rate: 100,
              chance: .66,
              total: 250,
              generator: () => {
                this.generate({
                  useOffset: false,
                  xPos: xStart,
                  yPos: yStart,
                  headingX: xHeading * (1 + Generator.random(-.02, .02, 5)),
                  headingY: yHeading * (1 + Generator.random(-.02, .02, 5)),
                  density: Generator.random(1, 100, 2),
                  mass: Generator.random(5, 5000, 0)
                });
              }
            })
          )
          this.dragPointer.remove();
          this.dragStart.remove();
          this.dragLine.remove();
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

    // this.addGenerator(
    //   new Generator({
    //     rate: 1,
    //     chance: .95,
    //     generator: () => {
    //       this.generate({
    //         xPos: Generator.random(this.xPrime * -.1, this.xPrime * .1, 0), // - Generator.random(this.xPrime / 2000, this.xPrime / 1000),
    //         headingY: Generator.random(-.01, .01, 3) - 1.2,
    //         density: Generator.random(0.1, 2, 2),
    //         mass: Generator.random(10, 100, 0)
    //       });
    //     }
    //   })
    // );

    // this.addGenerator(
    //   new Generator({
    //     rate: 100,
    //     chance: .95,
    //     generator: () => {
    //       this.generate({
    //         xPos: Generator.random(this.xPrime * .9, this.xPrime * 1.1, 0), // - Generator.random(this.xPrime / 2000, this.xPrime / 1000),
    //         headingY: 1.2 + Generator.random(-.01, .01, 3),
    //         density: Generator.random(0.1, 2, 2),
    //         mass: Generator.random(10, 100, 0)
    //       });
    //     }
    //   })
    // );
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
      this.processEntity(entity, index);
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
