"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyFilesRemote = exports.copyFiles = void 0;
const util_1 = require("@mojule/util");
const fs_1 = require("fs");
const files_1 = require("@mojule/files");
const node_fetch_1 = require("node-fetch");
const { copyFile, writeFile } = fs_1.promises;
const copyFiles = async (db, sourceDirectory, destDirectory) => {
    const copyEntityFile = async (entity) => {
        const { path } = entity.meta;
        const sourcePath = util_1.join(sourceDirectory, path);
        const destPath = util_1.join(destDirectory, path);
        await files_1.ensureParentDirectories(destPath);
        await copyFile(sourcePath, destPath);
    };
    const fileIds = await db.collections.file.ids();
    const imageIds = await db.collections.imageFile.ids();
    const zipIds = await db.collections.zipFile.ids();
    const files = await db.collections.file.loadMany(fileIds);
    const images = await db.collections.imageFile.loadMany(imageIds);
    const zips = await db.collections.zipFile.loadMany(zipIds);
    const entities = [
        ...files,
        ...images,
        ...zips.filter(z => !z.isExtractOnly)
    ];
    await Promise.all(entities.map(copyEntityFile));
};
exports.copyFiles = copyFiles;
const copyFilesRemote = async (db, uri, destDirectory) => {
    const copyEntityFile = async (entity) => {
        const { path } = entity.meta;
        let sourceUri = uri;
        if (sourceUri.endsWith('/'))
            sourceUri = sourceUri.slice(0, -1);
        sourceUri += path;
        const destPath = util_1.join(destDirectory, path);
        await files_1.ensureParentDirectories(destPath);
        const response = await node_fetch_1.default(sourceUri);
        const buffer = await response.buffer();
        await writeFile(destPath, buffer);
    };
    const fileIds = await db.collections.file.ids();
    const imageIds = await db.collections.imageFile.ids();
    const zipIds = await db.collections.zipFile.ids();
    const files = await db.collections.file.loadMany(fileIds);
    const images = await db.collections.imageFile.loadMany(imageIds);
    const zips = await db.collections.zipFile.loadMany(zipIds);
    const entities = [
        ...files,
        ...images,
        ...zips.filter(z => !z.isExtractOnly)
    ];
    await Promise.all(entities.map(copyEntityFile));
};
exports.copyFilesRemote = copyFilesRemote;
//# sourceMappingURL=copy-files.js.map