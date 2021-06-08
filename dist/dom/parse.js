"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDocument = exports.parseFirst = void 0;
const _1 = require(".");
const parseFirst = (html) => _1.parseFragment(html).firstChild;
exports.parseFirst = parseFirst;
const parseDocument = (html) => {
    const dom = _1.createDom(html);
    return dom.window.document;
};
exports.parseDocument = parseDocument;
//# sourceMappingURL=parse.js.map