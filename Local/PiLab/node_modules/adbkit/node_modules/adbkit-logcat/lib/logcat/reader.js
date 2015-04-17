(function() {
  var EventEmitter, Parser, Priority, Reader, Transform,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  Parser = require('./parser');

  Transform = require('./transform');

  Priority = require('./priority');

  Reader = (function(_super) {
    __extends(Reader, _super);

    Reader.ANY = '*';

    function Reader(options) {
      var _base;
      this.options = options != null ? options : {};
      (_base = this.options).format || (_base.format = 'binary');
      if (this.options.fixLineFeeds == null) {
        this.options.fixLineFeeds = true;
      }
      this.filters = {
        all: -1,
        tags: {}
      };
      this.parser = Parser.get(this.options.format);
      this.stream = null;
    }

    Reader.prototype.exclude = function(tag) {
      if (tag === Reader.ANY) {
        return this.excludeAll();
      }
      this.filters.tags[tag] = Priority.SILENT;
      return this;
    };

    Reader.prototype.excludeAll = function() {
      this.filters.all = Priority.SILENT;
      return this;
    };

    Reader.prototype.include = function(tag, priority) {
      if (priority == null) {
        priority = Priority.DEBUG;
      }
      if (tag === Reader.ANY) {
        return this.includeAll(priority);
      }
      this.filters.tags[tag] = this._priority(priority);
      return this;
    };

    Reader.prototype.includeAll = function(priority) {
      if (priority == null) {
        priority = Priority.DEBUG;
      }
      this.filters.all = this._priority(priority);
      return this;
    };

    Reader.prototype.resetFilters = function() {
      this.filters.all = -1;
      this.filters.tags = {};
      return this;
    };

    Reader.prototype._hook = function() {
      var transform,
        _this = this;
      if (this.options.fixLineFeeds) {
        transform = this.stream.pipe(new Transform);
        transform.on('data', function(data) {
          return _this.parser.parse(data);
        });
      } else {
        this.stream.on('data', function(data) {
          return _this.parser.parse(data);
        });
      }
      this.stream.on('error', function(err) {
        return _this.emit('error', err);
      });
      this.stream.on('end', function() {
        return _this.emit('end');
      });
      this.stream.on('finish', function() {
        return _this.emit('finish');
      });
      this.parser.on('entry', function(entry) {
        if (_this._filter(entry)) {
          return _this.emit('entry', entry);
        }
      });
      this.parser.on('error', function(err) {
        return _this.emit('error', err);
      });
    };

    Reader.prototype._filter = function(entry) {
      var priority;
      priority = this.filters.tags[entry.tag];
      if (!(priority >= 0)) {
        priority = this.filters.all;
      }
      return entry.priority >= priority;
    };

    Reader.prototype._priority = function(priority) {
      if (typeof priority === 'number') {
        return priority;
      }
      return Priority.fromName(priority);
    };

    Reader.prototype.connect = function(stream) {
      this.stream = stream;
      this._hook();
      return this;
    };

    Reader.prototype.end = function() {
      this.stream.end();
      return this;
    };

    return Reader;

  })(EventEmitter);

  module.exports = Reader;

}).call(this);
