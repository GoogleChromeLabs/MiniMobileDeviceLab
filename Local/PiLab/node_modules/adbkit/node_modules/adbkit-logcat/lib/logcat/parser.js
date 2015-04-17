(function() {
  var EventEmitter, Parser, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  Parser = (function(_super) {
    __extends(Parser, _super);

    function Parser() {
      _ref = Parser.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Parser.get = function(type) {
      var parser;
      parser = require("./parser/" + type);
      return new parser();
    };

    Parser.prototype.parse = function() {
      throw new Error("parse() is unimplemented");
    };

    return Parser;

  })(EventEmitter);

  module.exports = Parser;

}).call(this);
