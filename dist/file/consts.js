"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zipFormats = exports.exludeImageFormats = exports.toPngFormats = exports.rasterFormats = void 0;
exports.rasterFormats = [
    'image/bmp', 'image/gif', 'image/jpeg', 'image/png', 'image/tiff'
];
exports.toPngFormats = [
    'image/bmp', 'image/gif', 'image/tiff'
];
exports.exludeImageFormats = [
    'image/vnd.dwg'
];
// I can't believe this is still a thing
exports.zipFormats = [
    'multipart/x-zip',
    'application/zip',
    'application/zip-compressed',
    'application/x-zip-compressed'
];
//# sourceMappingURL=consts.js.map