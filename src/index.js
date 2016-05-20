/**
 * classes touchable
 * @author zcl
 * @create 2016-04-26 14:53
 */

'use strict';

var object =    require('blear.utils.object');
var Draggable = require('blear.classes.draggable');

var defaults = {
    /**
     * 滑动的元素
     * @type String|HTMLElement|null
     */
    el: null,

    /**
     * 点击事件时间间隔
     * @type Number
     */
    tapIntervalTime: 100,

    /**
     * 滑动事件移动距离
     * @type Number
     */
    swipeMinDistance: 60,

    /**
     * 是否取消默认
     * @type Boolean
     */
    preventDefault: true
};


/**
 * 获取两次事件的距离
 * @param {Object} pos1 坐标
 * @param {Object} pos2 坐标
 * @returns {Number}
 */
var getDistance = function (pos1, pos2) {
    var x = pos2.x - pos1.x,
        y = pos2.y - pos1.y;
    return Math.sqrt((x * x) + (y * y));
};

/**
 * 获取两次事件的角度
 * @param {Object} p1 坐标
 * @param {Object} p2 坐标
 * @returns {Number}
 */
var getAngle = function (p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
};

/**
 * 获取两次事件的方向
 * @param {Number} agl 角度
 * @returns {String|Null}
 */
var getDirectionFromAngle = function (agl) {
    var directions = {
        Up: agl < -45 && agl > -135,
        Down: agl >= 45 && agl < 135,
        Left: agl >= 135 || agl <= -135,
        Right: agl >= -45 && agl <= 45
    };
    for (var key in directions) {
        if (directions[key]) return key;
    }
    return null;
};


/**
 * @class Touchable
 * @extend Draggable
 * @constructor
 */
var Touchable = Draggable.extend({
    className: 'Touchable',
    constructor: function (options) {
        var the = this;
        options = object.assign(true, {}, defaults, options, {
            shadow: false,
            draggable: false,
            containerEl: options.el
        });
        options.el = null;
        Touchable.parent(the, options);
        the[_meta] = {};

        the.on('dragStart', function (meta) {
            the[_meta].startX = meta.startX;
            the[_meta].startY = meta.startY;
            the[_meta].startTime = meta.startTime;
            the.emit('touchStart', meta);
        });

        the.on('dragMove', function (meta) {
            the.emit('touchMove', meta);
        });

        the.on('dragEnd', function (meta) {
            the[_meta].endX = meta.endX;
            the[_meta].endY = meta.endY;
            the[_meta].endTime = meta.endTime;

            var positionStart = {
                x: the[_meta].startX,
                y: the[_meta].startY
            };

            var positionEnd = {
                x: the[_meta].endX,
                y: the[_meta].endY
            };

            if (positionStart.x === positionEnd.x && positionStart.y === positionEnd.y &&
                the[_meta].endTime - the[_meta].startTime < options.tapIntervalTime) {
                the.emit('tap', meta);
            }

            var distance = getDistance(positionStart, positionEnd);
            var angle = getAngle(positionStart, positionEnd);
            var direction = getDirectionFromAngle(angle);

            if (distance > options.swipeMinDistance) {
                the.emit('swipe', meta);
                the.emit('swipe' + direction, meta);
            }

            for (var i in the[_meta]) {
                the[_meta][i] = null;
            }

            the.emit('touchEnd', meta);
        });
    },

    /**
     * 销毁实例
     */
    destroy: function () {
        Touchable.parent.destroy(this);
    }
});

var _meta = Touchable.sole();

Touchable.defaults = defaults;
module.exports = Touchable;
