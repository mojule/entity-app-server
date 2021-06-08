"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFragment = exports.createDom = void 0;
const jsdom_1 = require("jsdom");
const createDom = (html = '<!doctype html>') => new jsdom_1.JSDOM(html);
exports.createDom = createDom;
exports.parseFragment = jsdom_1.JSDOM.fragment;
//# sourceMappingURL=index.js.map