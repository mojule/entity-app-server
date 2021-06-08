"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diskFileToCreateData = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const mime = require("mime");
const { parse } = path_1.posix;
const { readFile } = fs_1.promises;
const diskFileToCreateData = async (diskPath, tags = []) => {
    const { base: originalname } = parse(diskPath);
    const buffer = await readFile(diskPath);
    const mimetype = mime.getType(originalname) || 'application/octet-stream';
    const { byteLength: size } = buffer;
    const fileData = {
        originalname, buffer, mimetype, size, tags
    };
    return fileData;
};
exports.diskFileToCreateData = diskFileToCreateData;
//# sourceMappingURL=disk-file-to-create-data.js.map