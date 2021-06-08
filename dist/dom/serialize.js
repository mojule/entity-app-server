"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeHtml = void 0;
const util_1 = require("./util");
const doctype = '<!doctype html>';
const serializeHtml = (node) => {
    if (util_1.isTextNode(node))
        return node.nodeValue || '';
    if (util_1.isElementNode(node))
        return node.outerHTML;
    if (util_1.isCommentNode(node))
        return `<!--${node.nodeValue}-->`;
    if (util_1.isDocument(node))
        return serializeChildren(node);
    if (util_1.isFragment(node))
        return serializeFragment(node);
    if (util_1.isDocType(node))
        return doctype;
    throw Error('Unsupported node type');
};
exports.serializeHtml = serializeHtml;
const serializeChildren = (node) => [...node.childNodes].map(exports.serializeHtml).join('');
const serializeFragment = (fragment) => {
    const [first, second, ...rest] = fragment.children;
    if (first && first.tagName === 'HEAD' && second && second.tagName === 'BODY' &&
        rest.length === 0) {
        const head = exports.serializeHtml(first);
        const body = exports.serializeHtml(second);
        const html = `<html>${head}${body}</html>`;
        return `${doctype}${html}`;
    }
    return serializeChildren(fragment);
};
//# sourceMappingURL=serialize.js.map