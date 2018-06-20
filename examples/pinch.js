/**
 * 文件描述
 * @author ydr.me
 * @create 2018-06-20 15:38
 * @update 2018-06-20 15:38
 */


'use strict';

var Touchable = require('../src/index');

var consoleEl = document.getElementById('console');

var tch = new Touchable({
    el: '#demo'
});


tch.on('touchStart', function (ev) {
    console(ev);
});

// ==================================
function console(ev) {
    consoleEl.innerHTML = '<p>' + JSON.stringify(ev, null, 2) + '</p>';
}
