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


var startRotation = 0;
var startScale = 1;
var startTranslateX = 0;
var startTranslateY = 0;
var currentRotation = 0;
var currentScale = 1;
var currentTranslateX = 0;
var currentTranslateY = 0;

tch.on('dragMove', function (meta) {
    if (meta.length > 1) {
        return;
    }

    currentTranslateX = startTranslateX + meta.deltaX;
    currentTranslateY = startTranslateY + meta.deltaY;
    transform();
});

tch.on('dragEnd', function (meta) {
    if (meta.length > 1) {
        return;
    }

    startTranslateX += meta.deltaX;
    startTranslateY += meta.deltaY;
});

tch.on('pinch', function (meta) {
    currentRotation = startRotation + meta.rotation;
    currentScale = startScale * meta.scale;
    transform();
});

tch.on('pinchEnd', function (meta) {
    startRotation += meta.rotation;
    startScale *= meta.scale;
});

// ==================================
function print(ev) {
    consoleEl.innerHTML = '<p>' + JSON.stringify(ev, null, 2) + '</p>';
}

function transform() {
    demoEl.style.transform = 'rotate(' + (currentRotation) + 'deg) ' +
        'scale(' + (currentScale) + ') ' +
        'translateX(' + currentTranslateX + 'px) ' +
        'translateY(' + currentTranslateY + 'px)';
}
