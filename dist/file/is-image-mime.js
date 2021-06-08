"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isImageMime = void 0;
const consts_1 = require("./consts");
const isImageMime = (mimetype) => {
    if (!mimetype.startsWith('image/'))
        return false;
    if (consts_1.exludeImageFormats.includes(mimetype))
        return false;
    // should we only include supported types actually?
    return true;
};
exports.isImageMime = isImageMime;
//# sourceMappingURL=is-image-mime.js.map