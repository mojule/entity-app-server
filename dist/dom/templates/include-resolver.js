"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadIncludeResolver = void 0;
const files_1 = require("@mojule/files");
const fs_1 = require("fs");
const path_1 = require("path");
const loadIncludeResolver = async (includesPath, useBuffer = true) => {
    if (!useBuffer) {
        const includeResolver = (id) => {
            const includePath = path_1.join(includesPath, id);
            return fs_1.readFileSync(includePath, 'utf8');
        };
        return includeResolver;
    }
    const bufferMap = await files_1.readPathBufferMap(includesPath);
    const includeResolver = (id) => {
        if (bufferMap[id] === undefined) {
            throw Error(`Expected an include named ${id}`);
        }
        return bufferMap[id].toString('utf8');
    };
    return includeResolver;
};
exports.loadIncludeResolver = loadIncludeResolver;
//# sourceMappingURL=include-resolver.js.map