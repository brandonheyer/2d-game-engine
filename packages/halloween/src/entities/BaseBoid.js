import {BaseEntity, Point, Vector} from '2d-engine';

var tempVector = new Vector(0, 0);
var id = 0;

class BaseBoid extends BaseEntity {
  constructor(options) {
    super(options);

    this.id = ++id;

    this.heading = new Vector(1, 0);
    this.heading.normalize();

    this.fill = options.fill || "#ff0000";
    this.preUpdate = options.preUpdate.bind(this);
    this.updateXPos = options.updateXPos.bind(this);
    this.updateYPos = options.updateYPos.bind(this);

    this.time = 0;
  }

  startingPosition() {
    return new Point(
      0,
      this.yScale.domain()[1] / 2
    );
  }

  initializeProperties(options) {
    super.initializeProperties(options);

    options = options || {};

    this.radius = options.radius;
  }

  update(delta) {
    this.lastX = this.pos.x;
    this.lastY = this.pos.y;

    this.preUpdate(delta);
    this.updateXPos(delta);
    this.updateYPos(delta);

    if (this.pos.x > this.xMax) {
      this.drawPath = false;
    }

    this.pos.x = (this.pos.x + this.xMax) % this.xMax;

    this.pos.y += (this.yMax / 2);
    this.pos.y = (this.pos.y + this.yMax) % this.yMax;

    this.lastPath = this.lastX + " " + this.lastY;
    this.pathString += this.lastPath + " L ";

    this.circleElement.translation.set(
      this.xScale(this.pos.x),
      this.yScale(this.pos.y)
    );

    if (this.drawPath) {
      const anchor = new Two.Anchor(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y)
      );

      this.pathElement.vertices.push(anchor);
    }
  }

  updateStyles() {
    if (this.renderMethod) {
      this.renderMethod();
    }

    this.circleElement.fill = this.fill;
  }

  destroy() {
    this.element.remove();
    this.element = undefined;
  }

  addPath() {
    this.pathElement = new Two.Path([], false, false);
    this.pathElement.addTo(this.element);

    this.pathString = "";

    this.pathElement.fill = "none";
    this.pathElement.stroke = "#663311";

    this.drawPath = 2;
  }

  render(canvas) {
    if (!this.element) {
      this.element = canvas.makeGroup();

      this.addPath();

      this.circleElement = canvas.makeCircle(
        this.xScale(this.pos.x),
        this.yScale(this.pos.y),
        this.xScale(this.radius)
      );

      this.circleElement.addTo(this.element);
    }

    this.circleElement.noStroke();
    this.circleElement.miter = undefined;
    this.circleElement.cap = undefined;
    this.circleElement.join = undefined;

    this.updateStyles();
  }
}

export default BaseBoid;
