"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFragment = exports.isDocType = exports.isDocument = exports.isCommentNode = exports.isTextNode = exports.isElementNode = void 0;
const NodeType = {
    ELEMENT_NODE: 1,
    TEXT_NODE: 3,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11
};
const isElementNode = (value) => value.nodeType === NodeType.ELEMENT_NODE;
exports.isElementNode = isElementNode;
const isTextNode = (value) => value.nodeType === NodeType.TEXT_NODE;
exports.isTextNode = isTextNode;
const isCommentNode = (value) => value.nodeType === NodeType.COMMENT_NODE;
exports.isCommentNode = isCommentNode;
const isDocument = (value) => value.nodeType === NodeType.DOCUMENT_NODE;
exports.isDocument = isDocument;
const isDocType = (value) => value.nodeType === NodeType.DOCUMENT_TYPE_NODE;
exports.isDocType = isDocType;
const isFragment = (value) => value.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE;
exports.isFragment = isFragment;
//# sourceMappingURL=util.js.map