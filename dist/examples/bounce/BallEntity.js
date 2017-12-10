import {Point, Vector, BaseEntity} from '2d-engine';

export default class BallEntity extends BaseEntity {
  constructor(options) {
    super(options);

    this.speed = 4;
    this.heading = new Vector(
      Math.random(),
      Math.random()
    );
    this.radius = 500;
  }

  startingPosition() {
    return new Point(
      Math.floor(Math.random() * this.xMax),
      Math.floor(Math.random() * this.yMax)
    );
  }

  setScales(engine) {
    super.setScales(engine);

    this.pos = this.startingPosition();
  }

  update(delta) {
    var other;
    var tempVector;
    var magnitude;
    var pushDistance;

    this.heading.y = this.heading.y + (.1 / delta);

    for (var i = 0; i < this.entities.length; i++) {
      other = this.entities[i];

      tempVector = this.pos.minus(other.pos);
      magnitude = tempVector.magnitude();

      if (other !== this && magnitude < (this.radius + other.radius)) {
        pushDistance = tempVector.times((this.radius + other.radius - magnitude) / magnitude);

        this.pos.plusEquals(pushDistance);
        other.pos.x -= pushDistance.x;
        other.pos.y -= pushDistance.y;

        tempVector = (this.heading.minus(other.heading));
        pushDistance.normalize();
        var dot = tempVector.dot(pushDistance);

        if (dot > 0) {

        } else {
          pushDistance.timesEquals(-.9 * dot);

          this.heading.plusEquals(pushDistance);
          other.heading.minusEquals(pushDistance);
        }
      }
    }

    this.pos.scalePlusEquals(this.speed * delta, this.heading);

    if (this.pos.x > this.xMax - this.radius) {
      this.pos.x = (this.xMax - this.radius) - (this.pos.x - (this.xMax - this.radius));
      this.heading.x *= -.9;
      this.heading.y *= .9;
    } else if (this.pos.x < this.radius) {
      this.pos.x = ((this.radius) - (this.pos.x - this.radius));
      this.heading.x *= -.9;
      this.heading.y *= .9;
    }

    if (this.pos.y > this.yMax - this.radius) {
      this.pos.y = (this.yMax - this.radius) - (this.pos.y - (this.yMax - this.radius));
      this.heading.y *= -.9;
      this.heading.x *= .9;
    }

    this.element
      .attr('transform', 'translate(' + this.xScale(this.pos.x) + ',' + this.yScale(this.pos.y) + ')');
  }

  render(canvas) {
    this.element = canvas.append('circle')
      .attr('r', this.xScale(this.radius));
  }
}
