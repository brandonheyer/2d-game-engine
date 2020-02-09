import {
  separation,
  bounce,
  boundaryReflect,
  gravity,
  initKillWhenStable,
  killWhenStable
} from "2d-engine";

import BaseBallEntity from "./base-ball-entity";

export default class BallEntity extends BaseBallEntity {
  initializeProperties(options) {
    initKillWhenStable(this);

    this.ballAbsorbtion = options.ballAbsorbtion || .9;
    this.wallAbsorbtion = options.wallAbsorbtion || .98;
    this.gravity = options.gravity = 9.8; 

    super.initializeProperties(options);
  }

  onCollision(other, normalizedVector, magnitude) {
    separation(this, other, normalizedVector, magnitude);
    bounce(this, other, normalizedVector, this.ballAbsorbtion);
  }

  preUpdatePosition(delta) {
    gravity(this, delta, this.gravity);
  }

  postUpdatePosition() {
    boundaryReflect(this, this.wallAbsorbtion);
    killWhenStable(this);
  }
}
