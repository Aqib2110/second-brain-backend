"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.random = random;
function random(len) {
    let string = "biudhuihdchsduit246mansiomaisabiuwehaleemauidwhd";
    let lengh = string.length;
    let ans = "";
    for (let i = 0; i < len; i++) {
        ans += string[Math.floor(Math.random() * lengh)];
    }
    return ans;
}
