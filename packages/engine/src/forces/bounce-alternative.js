/**
 * Code adapted from:
 *
 * Adam Brookes’ Elastic Collision Code
 * http://cobweb.cs.uga.edu/~maria/classes/4070-Spring-2017/Adam%20Brookes%20Elastic%20collision%20Code.pdf
 */
const BOUNCE_ABSORPTION_BALL = .9;

function bounce(a, b, force, absorbtion = BOUNCE_ABSORPTION_BALL) {
  const v1 = a.heading;
  const v2 = b.heading;
  const m1 = a.mass;
  const m2 = b.mass;
  const x1 = a.pos;
  const x2 = b.pos;

  const v1v2Diff = v1.minus(v2);
  const v2v1Diff = v2.minus(v1);
  const x1x2Diff = x1.minus(x2);
  const x2x1Diff = x2.minus(x1);

  const v1dotx1 = v1v2Diff.dot(x1x2Diff);
  const v2dotx2 = v2v1Diff.dot(x2x1Diff);

  const mag = x1x2Diff.magnitudeSq();

  const m1m2 = m1 + m2;

  a.heading = v1.minus(
    x1x2Diff.times(
      ((2 * m2) / m1m2) *
      (v1dotx1 / mag) *
      (a.dead ? 0 : absorbtion)
    )
  );

  b.heading = v2.minus(
    x2x1Diff.times(
      ((2 * m1) / m1m2) *
      (v2dotx2 / mag) *
      (b.dead ? 0 : absorbtion)
    )
  );
}

export default bounce;
