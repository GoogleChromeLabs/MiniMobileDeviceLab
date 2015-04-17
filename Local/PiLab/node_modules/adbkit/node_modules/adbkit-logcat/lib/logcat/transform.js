(function() {
  var Stream, Transform,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Stream = require('stream');

  Transform = (function(_super) {
    __extends(Transform, _super);

    function Transform(options) {
      this.savedR = null;
      Transform.__super__.constructor.call(this, options);
    }

    Transform.prototype._transform = function(chunk, encoding, done) {
      var hi, last, lo;
      lo = 0;
      hi = 0;
      if (this.savedR) {
        if (chunk[0] !== 0x0a) {
          this.push(this.savedR);
        }
        this.savedR = null;
      }
      last = chunk.length - 1;
      while (hi <= last) {
        if (chunk[hi] === 0x0d) {
          if (hi === last) {
            this.savedR = chunk.slice(last);
            break;
          } else if (chunk[hi + 1] === 0x0a) {
            this.push(chunk.slice(lo, hi));
            lo = hi + 1;
          }
        }
        hi += 1;
      }
      if (hi !== lo) {
        this.push(chunk.slice(lo, hi));
      }
      done();
    };

    return Transform;

  })(Stream.Transform);

  module.exports = Transform;

}).call(this);
