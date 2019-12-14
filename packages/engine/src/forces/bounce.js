/**
 * Code adapted from:
 *
 * Adam Brookes’ Elastic Collision Code
 * http://cobweb.cs.uga.edu/~maria/classes/4070-Spring-2017/Adam%20Brookes%20Elastic%20collision%20Code.pdf
 */

import Vector from "../Vector";

const BOUNCE_ABSORPTION_BALL = .9;

let aDot;
let bDot;
let aTangentDot;
let bTangentDot;
let aVelocityScalar;
let bVelocityScalar;

let tangent = new Vector(0, 0);
let aVelocity = new Vector(0, 0);
let bVelocity = new Vector(0, 0);
let aTangentVelocity = new Vector(0, 0);
let bTangentVelocity = new Vector(0, 0);

function bounce(a, b, force, absorbtion = BOUNCE_ABSORPTION_BALL) {
  tangent.x = force.y * -1;
  tangent.y = force.x;

  aDot = force.dot(a.heading);
  bDot = force.dot(b.heading);

  aTangentDot = tangent.dot(a.heading);
  bTangentDot = tangent.dot(b.heading);

  aVelocityScalar = (
    aDot *
    (a.mass - b.mass) +
    2 * b.mass * bDot
  ) / (a.mass + b.mass);

  bVelocityScalar = (
    bDot *
    (b.mass - a.mass) +
    2 * a.mass * aDot
  ) / (a.mass + b.mass);

  aVelocity.x = force.x * aVelocityScalar;
  aVelocity.y = force.y * aVelocityScalar;

  bVelocity.x = force.x * bVelocityScalar;
  bVelocity.y = force.y * bVelocityScalar;

  aTangentVelocity.x = tangent.x * aTangentDot;
  aTangentVelocity.y = tangent.y * aTangentDot;

  bTangentVelocity.x = tangent.x * bTangentDot;
  bTangentVelocity.y = tangent.y * bTangentDot;

  a.heading.x = aTangentVelocity.x + (aVelocity.x * (a.dead ? 0 : absorbtion));
  a.heading.y = aTangentVelocity.y + (aVelocity.y * (a.dead ? 0 : absorbtion));

  b.heading.x = bTangentVelocity.x + (bVelocity.x * (b.dead ? 0 : absorbtion));
  b.heading.y = bTangentVelocity.y + (bVelocity.y * (b.dead ? 0 : absorbtion));
}

export default bounce;
