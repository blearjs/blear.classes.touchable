/**
 * 文件描述
 * @author ydr.me
 * @create 2018-06-20 15:38
 * @update 2018-06-20 15:38
 */


'use strict';

var Touchable = require('../src/index');

var consoleEl = document.getElementById('console');
var demoEl = document.getElementById('demo');

var tch = new Touchable({
    el: '#demo'
});

var startAngle = 0;
var startScale = 1;
tch.on('pinch', function (meta) {
    var currentRotate = startAngle - meta.rotation;
    var currentScale = startScale * meta.scale;
    // demoEl.innerHTML = current + ' deg';
    demoEl.style.transform = 'rotate(' + (currentRotate) + 'deg) scale(' + (currentScale) + ')';
    console.log(meta);
});
tch.on('pinchEnd', function (meta) {
    startAngle -= meta.rotation;
    startScale *= meta.scale;
});

// ==================================
function print(ev) {
    consoleEl.innerHTML = '<p>' + JSON.stringify(ev, null, 2) + '</p>';
}
