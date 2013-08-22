/**
 * Inherit
 *
 * Copyright (c) 2012-2013 Filatov Dmitry (dfilatov@yandex-team.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * @version 0.2.0
 */

var noOp = function() {},
    keys = Object.keys,
    hasOwnProperty = Object.prototype.hasOwnProperty,
    noMixableProps = ['__self', '__constructor', 'constructor'];

function extend(o1, o2) {
    for(var i in o2) {
        hasOwnProperty.call(o2, i) && (o1[i] = o2[i]);
    }

    return o1;
}

function isFunction(o) {
    return typeof o === 'function';
}

function override(base, res, add) {
    keys(add).forEach(function(name) {
        var prop = add[name];
        if(isFunction(prop) && prop.toString().indexOf('.__base') > -1) {
            var baseMethod = base[name] || noOp;
            res[name] = function() {
                var _this = this,
                    baseSaved = _this.__base;

                _this.__base = baseMethod;
                var res = prop.apply(_this, arguments);
                _this.__base = baseSaved;
                return res;
            };
        }
        else {
            res[name] = prop;
        }
    });
}

module.exports = function() {
    var args = arguments,
        withMixins = Array.isArray(args[0]),
        hasBase = withMixins || isFunction(args[0]),
        base = hasBase? withMixins? args[0][0] : args[0] : noOp,
        props = args[hasBase? 1 : 0] || {},
        staticProps = args[hasBase? 2 : 1],
        res = props.__constructor || (hasBase && base.prototype.__constructor)?
            function() {
                return this.__constructor.apply(this, arguments);
            } :
            function() {};

    if(!hasBase) {
        return extend((res.prototype = props).__self = res, staticProps);
    }

    var resultPtp = extend(res, base).prototype = Object.create(base.prototype, { constructor : res });

    props && override(base.prototype, (resultPtp.__self = res).prototype, props);
    staticProps && override(base, res, staticProps);

    if(withMixins) {
        var i = 1, mixins = args[0], mixin, propName;
        while(mixin = mixins[i++]) {
            if(isFunction(mixin)) {
                extend(res, mixin);
                mixin = mixin.prototype;
            }

            for(propName in mixin) {
                if(mixin.hasOwnProperty(propName) && noMixableProps.indexOf(propName) === -1) {
                    resultPtp[propName] = mixin[propName];
                }
            }
        }
    }

    return res;
};
