"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeZipFs = exports.removeFs = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const { unlink } = fs_1.promises;
const removeFs = async (entity, rootPath) => {
    const pathToExisting = path_1.join(rootPath, entity.meta.path);
    unlink(pathToExisting);
};
exports.removeFs = removeFs;
const removeZipFs = async (entity, rootPath, unlinkZipChildren) => {
    if (!entity.isExtractOnly) {
        await exports.removeFs(entity, rootPath);
    }
    if (unlinkZipChildren) {
        const allPaths = entity.paths.map(p => path_1.join(rootPath, p));
        await Promise.all(allPaths.map(unlink));
    }
};
exports.removeZipFs = removeZipFs;
//# sourceMappingURL=remove-files.js.map