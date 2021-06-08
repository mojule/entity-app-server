"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextFilename = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
// makes sure that filenames are both consistent and unique
const nextFilename = (root, filename) => {
    if (filename === '')
        throw Error('Expected a filename');
    const { base } = path_1.parse(filename);
    const segs = base.split('.').map(s => s.split(' ').join('-'));
    const name = segs.shift();
    const ext = segs.length > 0 ? ['', ...segs].join('.') : '';
    let currentFilename = name + ext;
    let currentFilePath = path_1.join(root, currentFilename);
    let index = 1;
    while (fs_1.existsSync(currentFilePath)) {
        currentFilename = `${name}-copy-${index}${ext}`;
        currentFilePath = path_1.join(root, currentFilename);
        index++;
    }
    return currentFilename;
};
exports.nextFilename = nextFilename;
//# sourceMappingURL=next-filename.js.map