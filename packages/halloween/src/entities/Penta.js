import { Point } from '2d-engine';
import BaseOrbs from "./BaseOrbs";

export default class Serpent extends BaseOrbs {
  constructor(options) {
    super(
      Object.assign(
        {
          connect: true,
          orbOptions: {
            preUpdatePosition: function(delta) {
              switch(this.index) {
                case 0:
                case 1:
                  this.pos.y = -1 * (2 + Math.sin(this.pos.x));
                  break;

                case 3:
                case 5:
                case 7:
                case 9:
                  this.pos.y = -.5 * (Math.sin(3 * this.pos.x) - 6);
                  break;

                case 2:
                case 4:
                case 6:
                case 8:
                case 10:
                  this.pos.y = -.5 * (Math.sin(2 * this.pos.x) - 6);
                  break;
              }
            },
            trace: false,
            radius: .4,
            speed: 400
          }
        },
        options
      )
    );
  }

  getOrbStartPositions() {
    const qPi = (Math.PI / 2);

    return [
      new Point(0, 0),
      new Point(4 * Math.PI, 0),
      new Point(4 * Math.PI, 0),
      new Point(2 * Math.PI + (3 * qPi) , 0),
      new Point(2 * Math.PI + (2 * qPi) , 0),
      new Point(2 * Math.PI + (qPi) , 0),
      new Point(2 * Math.PI, 0),
      new Point(3 * qPi , 0),
      new Point(2 * qPi , 0),
      new Point(qPi , 0),
      new Point(0, 0),
    ];
  }

  update(delta) {
    super.update(delta);

    const newGroup = this.engine.canvas.makeGroup();
    const order = [];

    this.orbs.forEach(o => {

    });
  }

  render(canvas) {
    super.render(canvas);

    this.connection.curved = true;
    this.connection.fill = "#ffffff";

    this.orbs.forEach(o => o.element.opacity = 0);
  }
}
