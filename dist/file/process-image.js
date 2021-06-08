"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageDimensions = exports.processImageFileData = void 0;
const Jimp = require("jimp");
const svg_size_1 = require("./svg-size");
const consts_1 = require("./consts");
const processImageFileData = async (fileData) => {
    const { originalname, mimetype, size, buffer, tags } = fileData;
    if (buffer === undefined) {
        throw Error(`Expected buffer`);
    }
    let name = originalname;
    let mime = mimetype;
    let image;
    let width = -1;
    let height = -1;
    if (consts_1.rasterFormats.includes(mimetype)) {
        image = await Jimp.read(buffer);
        width = image.getWidth();
        height = image.getHeight();
    }
    else if (mimetype === 'image/svg+xml') {
        const dimensions = svg_size_1.getSvgSize(buffer.toString('utf8'));
        width = dimensions.width;
        height = dimensions.height;
    }
    else {
        throw Error('Expected an image');
    }
    if (consts_1.toPngFormats.includes(mimetype)) {
        name += '.png';
        mime = 'image/png';
    }
    const imageFile = {
        name,
        meta: {
            path: '',
            mimetype: mime,
            size, width, height
        },
        tags
    };
    return { imageFile, image };
};
exports.processImageFileData = processImageFileData;
const getImageDimensions = async (mimetype, buffer) => {
    if (consts_1.rasterFormats.includes(mimetype)) {
        const image = await Jimp.read(buffer);
        const width = image.getWidth();
        const height = image.getHeight();
        return { width, height };
    }
    if (mimetype === 'image/svg+xml') {
        const dimensions = svg_size_1.getSvgSize(buffer.toString('utf8'));
        const width = dimensions.width;
        const height = dimensions.height;
        return { width, height };
    }
    return { width: -1, height: -1 };
};
exports.getImageDimensions = getImageDimensions;
//# sourceMappingURL=process-image.js.map