import _ from 'lodash';

export default class Generator {
  constructor(options) {
    this.rate = options.rate || 1;
    this.chance = options.chance || 1;
    this.generator = options.generator;
    this.total = options.total || Infinity;
    this.enabled = true;
    this.count = 0;
    this.last = 0;

    if (!_.isFunction(this.rate)) {
      let rate = this.rate;

      this.rate = function() {
        return rate;
      }
    }
  }

  enable() {
    this.enabled = true;

    return this;
  }

  disable() {
    this.enabled = false;

    return this;
  }

  generate(delta) {
    this.last += delta;

    if (this.count >= this.total) {
      return this.disable();
    }

    if (this.last >= this.rate() && Math.random() <= this.chance) {
      this.last = 0;
      this.count++;
      this.generator();
    }
  }
};

Generator.random = function(min, max, decimalPlaces) {
  let val = (Math.random() * (max - min)) + min;

  if (decimalPlaces === 0) {
    return Math.round(val);
  }

  if (decimalPlaces === undefined) {
    return val;
  }

  let pow = Math.pow(10, decimalPlaces);

  return Math.round(2 * val * pow) / pow;
};
