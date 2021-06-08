"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSvgSize = void 0;
const extractorRegExps = {
    root: /<svg\s[^>]+>/,
    width: /\bwidth=(['"])([^%]+?)\1/,
    height: /\bheight=(['"])([^%]+?)\1/,
    viewbox: /\bviewBox=(['"])(.+?)\1/
};
const isImageDimensions = (value) => value && value.width && value.height;
const isSvgParsedViewbox = (value) => value && isImageDimensions(value.viewbox);
const parseViewbox = (viewbox) => {
    var bounds = viewbox.split(' ');
    return {
        width: parseInt(bounds[2], 10),
        height: parseInt(bounds[3], 10)
    };
};
const parseAttributes = (root) => {
    const width = root.match(extractorRegExps.width);
    const height = root.match(extractorRegExps.height);
    const viewbox = root.match(extractorRegExps.viewbox);
    return {
        width: width ? parseInt(width[2], 10) : undefined,
        height: height ? parseInt(height[2], 10) : undefined,
        viewbox: viewbox ? parseViewbox(viewbox[2]) : undefined
    };
};
const calculateByDimensions = (attrs) => {
    const { width, height } = attrs;
    return { width, height };
};
const calculateByViewbox = (attrs) => {
    const ratio = attrs.viewbox.width / attrs.viewbox.height;
    if (attrs.width) {
        return {
            width: attrs.width,
            height: Math.floor(attrs.width / ratio)
        };
    }
    if (attrs.height) {
        return {
            width: Math.floor(attrs.height * ratio),
            height: attrs.height
        };
    }
    return {
        'width': attrs.viewbox.width,
        'height': attrs.viewbox.height
    };
};
const getSvgSize = (svg) => {
    const root = svg.match(extractorRegExps.root);
    if (root) {
        const attrs = parseAttributes(root[0]);
        if (isImageDimensions(attrs)) {
            return calculateByDimensions(attrs);
        }
        if (isSvgParsedViewbox(attrs)) {
            return calculateByViewbox(attrs);
        }
    }
    throw new TypeError('invalid svg');
};
exports.getSvgSize = getSvgSize;
//# sourceMappingURL=svg-size.js.map