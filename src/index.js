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
            var touches = meta.originalEvent.touches || [];
            var touch1 = touches[1];

            the[_startX] = meta.startX;
            the[_startY] = meta.startY;
            the[_startTime] = meta.startTime;
            the[_start1X] = meta.start1X = touch1 ? touch1.clientX : null;
            the[_start1Y] = meta.start1Y = touch1 ? touch1.clientY : null;
            meta.length = touches.length;
            the.emit('touchStart', meta);
        });

        the.on('dragMove', function (meta) {
            var touches = meta.originalEvent.touches || [];
            var length = meta.length = touches.length;
            var touch1 = touches[1];

            if (the[_start1X] === null && touch1) {
                the[_start1X] = meta.start1X = touch1.clientX;
                the[_start1Y] = meta.start1Y = touch1.clientY;
            }

            the.emit('touchMove', meta);
        });

        the.on('dragEnd', function (meta) {
            var oe = meta.originalEvent;
            var touches = oe.changedTouches || [];
            var touch1 = touches[1] || touches[0];
            var zoom = 1;
            var rotate = 0;
            var multiTouch = the[_start1X] !== null;

            the[_endX] = meta.endX;
            the[_endY] = meta.endY;
            the[_endTime] = meta.endTime;
            the[_end1X] = meta.end1X = touch1 ? touch1.clientX : the[_endX];
            the[_end1Y] = meta.end1Y = touch1 ? touch1.clientY : the[_endY];

            var p0Start = {
                x: the[_startX],
                y: the[_startY]
            };
            var p0End = {
                x: the[_endX],
                y: the[_endY]
            };
            var p1Start = {
                x: the[_start1X],
                y: the[_start1Y]
            };
            var p1End = {
                x: the[_end1X],
                y: the[_end1Y]
            };
            var d0 = getDistance(p0Start, p0End);
            var a0 = getAngle(p0Start, p0End);
            var deltaTime = the[_endTime] - the[_startTime];
            var direction = getDirectionFromAngle(a0);

            if (multiTouch) {
                var dStart = getDistance(p0Start, p1Start);
                var dEnd = getDistance(p0End, p1End);
                var aStart = getAngle(p0Start, p1Start);
                var aEnd = getAngle(p0End, p1End);
                zoom = getZoom(dStart, dEnd);
                rotate = aEnd - aStart;
            }

            meta.length = touches.length;
            meta.start1X = the[_start1X];
            meta.start1Y = the[_start1Y];
            meta.delta1X = the[_end1X] - the[_start1X];
            meta.delta1Y = the[_end1Y] - the[_start1Y];
            meta.direction = direction.toLowerCase();
            meta.angle = a0;
            meta.distanceStart = dStart;
            meta.distanceEnd = dEnd;
            meta.angleStart = aStart;
            meta.angleEnd = aEnd;
            meta.rotate = rotate;
            meta.zoom = zoom;

            if (d0 < options.tapMaxDistance && deltaTime < options.tapIntervalTime) {
                the.emit('tap', meta);
            }

            if (d0 > options.swipeMinDistance) {
                the.emit('swipe', meta);
                the.emit('swipe' + direction, meta);
            }

            the.emit('touchEnd', meta);

            if (multiTouch) {
                the.emit('zoom', meta);
                the.emit('rotate', meta);
            }
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

// ======================================================


/**
 * 获取两次事件的距离
 * @param {Object} p0 坐标
 * @param {Object} p1 坐标
 * @returns {Number}
 */
function getDistance(p0, p1) {
    var x = p1.x - p0.x,
        y = p1.y - p0.y;
    return Math.sqrt((x * x) + (y * y));
}

/**
 * 获取两次事件的角度
 * @param {Object} p0 坐标
 * @param {Object} p1 坐标
 * @returns {Number}
 */
function getAngle(p0, p1) {
    return Math.atan2(
        p0.y - p1.y, /* 因为网页的纵坐标是向下的，因此这里需要反减 */
        p1.x - p0.x
    ) * 180 / Math.PI;
}

/**
 * 获取两次事件的方向
 * @param {Number} agl 角度
 * @returns {String|Null}
 */
function getDirectionFromAngle(agl) {
    var directions = {
        Up: agl > 45 && agl < 135,
        Down: agl <= -45 && agl > -135,
        Left: agl >= 135 || agl <= -135,
        Right: agl >= -45 && agl <= 45
    };
    for (var key in directions) {
        if (directions[key]) return key;
    }
    return null;
}

/**
 * 根据两条线段获取缩放倍数
 * @param d0
 * @param d1
 */
function getZoom(d0, d1) {
    return d1 / d0;
}
