/**
 * classes touchable
 * @author zcl 云淡然
 * @created 2016-04-26 14:53
 * @updated 2016-12-16 16:06:56
 * @ref https://github.com/AlloyTeam/AlloyFinger/blob/master/alloy_finger.js
 */

'use strict';

var object = require('blear.utils.object');
var Draggable = require('blear.classes.draggable');

var defaults = {
    /**
     * 滑动的元素
     * @type String|HTMLElement|null
     */
    el: null,

    /**
     * tap 事件移动距离
     * @type Number
     */
    tapMaxDistance: 10,

    /**
     * 点击事件时间间隔
     * @type Number
     */
    tapIntervalTime: 250,

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

        the.on('dragStart', function (meta) {
            var oe = meta.originalEvent;
            var touches = oe.touches;

            the[_startX] = meta.startX;
            the[_startY] = meta.startY;
            the[_startTime] = meta.startTime;
            the[_start1X] = meta.start1X = (touches[1] || touches[0]).clientX;
            the[_start1Y] = meta.start1Y = (touches[1] || touches[0]).clientY;
            the.emit('touchStart', meta);
        });

        the.on('dragMove', function (meta) {
            the.emit('touchMove', meta);
        });

        the.on('dragEnd', function (meta) {
            var oe = meta.originalEvent;
            var touches = oe.touches;
            var touch1 = touches[1] || touches[0];

            the[_endX] = meta.endX;
            the[_endY] = meta.endY;
            the[_endTime] = meta.endTime;
            the[_end1X] = meta.end1X = touch1 ? touch1.clientX : the[_endX];
            the[_end1Y] = meta.end1Y = touch1 ? touch1.clientY : the[_endY];

            var positionStart = {
                x: the[_startX],
                y: the[_startY]
            };
            var positionEnd = {
                x: the[_endX],
                y: the[_endY]
            };

            if (Math.abs(positionStart.x - positionEnd.x) < options.tapMaxDistance &&
                Math.abs(positionStart.y - positionEnd.y) < options.tapMaxDistance &&
                the[_endTime] - the[_startTime] < options.tapIntervalTime) {
                the.emit('tap', meta);
            }

            var distance = getDistance(positionStart, positionEnd);
            var angle = getAngle(positionStart, positionEnd);
            var direction = getDirectionFromAngle(angle);

            if (distance > options.swipeMinDistance) {
                the.emit('swipe', meta);
                the.emit('swipe' + direction, meta);
            }

            the.emit('touchEnd', meta);
        });
    },

    /**
     * 销毁实例
     */
    destroy: function () {
        Touchable.invoke('destroy', this);
    }
});

var sole = Touchable.sole;
var _startX = sole();
var _startY = sole();
var _endX = sole();
var _endY = sole();
var _start1X = sole();
var _start1Y = sole();
var _end1X = sole();
var _end1Y = sole();
var _startTime = sole();
var _endTime = sole();

Touchable.defaults = defaults;
module.exports = Touchable;
