"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFs = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const { unlink } = fs_1.promises;
const removeFs = async (entity, rootPath) => {
    const pathToExisting = path_1.join(rootPath, entity.meta.path);
    return unlink(pathToExisting);
};
exports.removeFs = removeFs;
//# sourceMappingURL=remove-files.js.map