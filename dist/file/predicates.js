"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isZipFileEntityArray = exports.isZipFileEntity = void 0;
const isZipFileEntity = (entity) => Array.isArray(entity.paths);
exports.isZipFileEntity = isZipFileEntity;
const isZipFileEntityArray = (entities) => entities.every(exports.isZipFileEntity);
exports.isZipFileEntityArray = isZipFileEntityArray;
//# sourceMappingURL=predicates.js.map