import Vector from "../Vector";

let magnitudeSq;
let force;
let angle;

const universalGravitation = {
  initialize: (a, options = {}) => {
    a.forceVector = (a.forceVector || new Vector(0,0));
    a.tempVector = (a.tempVector || new Vector(0,0));
    a.GEE = a.engine.GEE;
    a.mass = options.mass || a.mass || 1;
  },

  preUpdatePosition: (a) => {
    a.forceVector.x = 0;
    a.forceVector.y = 0;
  },

  updateWithOther: (a, b) => {
    a.tempVector = b.pos.minus(a.pos);
    magnitudeSq = a.tempVector.magnitudeSq();
    force = a.GEE * a.mass * b.mass / magnitudeSq;
    angle = a.tempVector.angle();
    a.forceVector.x += Math.cos(angle) * force;
    a.forceVector.y += Math.sin(angle) * force;
  },

  updatePosition: (a, delta) => {
    a.heading.x += a.forceVector.x / a.mass;
    a.heading.y += a.forceVector.y / a.mass;
    a.pos.scalePlusEquals(delta, this.heading);

    console.log(a.pos);
  }
}

export default universalGravitation;
