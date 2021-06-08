"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileCreateStorageFactory = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const mime = require("mime");
const files_1 = require("@mojule/files");
const process_image_1 = require("./process-image");
const is_image_mime_1 = require("./is-image-mime");
const next_filename_1 = require("./next-filename");
const { writeFile } = fs_1.promises;
const { parse } = path_1.posix;
const noop = () => { };
const FileCreateStorageFactory = (db, diskFileDeps, imageFileDeps, zipFileDeps) => {
    const diskFile = (fileData) => createDiskFile(db.collections.file, fileData, diskFileDeps.getStaticPath, diskFileDeps.getRootPath, diskFileDeps.validator || noop);
    const imageFile = (fileData) => createImageFile(db.collections.imageFile, fileData, imageFileDeps.getStaticPath, imageFileDeps.getRootPath, imageFileDeps.validator || noop);
    const zipFile = async (fileData) => {
        const { mimetype, size, tags } = fileData;
        const { destFilePath, uriPath } = getPaths(fileData, zipFileDeps.getStaticPath, zipFileDeps.getRootPath);
        let bufferMap;
        let buffer;
        if (fileData.bufferMap) {
            bufferMap = fileData.bufferMap;
            buffer = await files_1.zip(bufferMap);
        }
        else if (fileData.buffer) {
            buffer = fileData.buffer;
            bufferMap = await files_1.unzip(buffer);
        }
        else {
            throw Error(`Expected buffer or bufferMap`);
        }
        const originalPaths = Object.keys(bufferMap);
        const files = [];
        const images = [];
        const paths = await Promise.all(originalPaths.map(async (originalPath) => {
            const { base, dir } = parse(originalPath);
            const mimetype = mime.getType(originalPath) || 'application/octet-stream';
            const buffer = bufferMap[originalPath];
            const fileData = {
                originalname: base,
                buffer: buffer,
                mimetype,
                size: buffer.byteLength,
                tags: []
            };
            const getRootPath = () => path_1.join(zipFileDeps.getRootPath(fileData), dir);
            if (is_image_mime_1.isImageMime(mimetype)) {
                const imageId = await createImageFile(db.collections.imageFile, fileData, imageFileDeps.getStaticPath, getRootPath, imageFileDeps.validator || noop);
                const ref = {
                    _collection: 'imageFile',
                    _id: imageId
                };
                images.push(ref);
                const imageEntity = await db.collections.imageFile.load(imageId);
                return imageEntity.meta.path;
            }
            const fileId = await createDiskFile(db.collections.file, fileData, diskFileDeps.getStaticPath, getRootPath, diskFileDeps.validator || noop);
            const ref = {
                _collection: 'file',
                _id: fileId
            };
            files.push(ref);
            const fileEntity = await db.collections.file.load(fileId);
            return fileEntity.meta.path;
        }));
        const zipFile = {
            name: uriPath,
            meta: {
                path: uriPath,
                mimetype, size,
            },
            paths,
            files,
            images,
            tags
        };
        const id = await db.collections.zipFile.create(zipFile);
        await files_1.ensureParentDirectories(destFilePath);
        await writeFile(destFilePath, buffer);
        return id;
    };
    return { diskFile, imageFile, zipFile };
};
exports.FileCreateStorageFactory = FileCreateStorageFactory;
const createFileEntity = (fileData, staticPath, rootPath) => {
    const { mimetype, size, tags } = fileData;
    const { uriPath } = getPaths(fileData, staticPath, rootPath);
    const diskFile = {
        name: uriPath,
        meta: {
            path: uriPath,
            mimetype, size
        },
        tags
    };
    return diskFile;
};
const createDiskFile = async (collection, fileData, staticPath, rootPath, validator) => {
    const { buffer } = fileData;
    if (buffer === undefined) {
        throw Error(`Expected buffer`);
    }
    const { destFilePath } = getPaths(fileData, staticPath, rootPath);
    const diskFile = createFileEntity(fileData, staticPath, rootPath);
    validator(diskFile, buffer);
    const id = await collection.create(diskFile);
    await files_1.ensureParentDirectories(destFilePath);
    await writeFile(destFilePath, buffer);
    return id;
};
const createImageFile = async (collection, fileData, staticPath, rootPath, validator) => {
    const { buffer } = fileData;
    if (buffer === undefined) {
        throw Error(`Expected buffer`);
    }
    const { imageFile, image } = await process_image_1.processImageFileData(fileData);
    const { mimetype } = imageFile.meta;
    const { destFilePath, uriPath } = getPaths(fileData, staticPath, rootPath);
    imageFile.meta.path = uriPath;
    imageFile.name = uriPath;
    validator(imageFile, buffer);
    await files_1.ensureParentDirectories(destFilePath);
    if (image && mimetype !== 'image/jpeg') {
        image.write(destFilePath);
        // re-encoding may change size!
        const { length } = await image.getBufferAsync(mimetype);
        imageFile.meta.size = length;
    }
    else {
        await writeFile(destFilePath, buffer);
    }
    return collection.create(imageFile);
};
const getPaths = (fileData, staticPath, rootPath) => {
    const { originalname } = fileData;
    const destPath = path_1.join(staticPath(fileData), rootPath(fileData));
    const destName = next_filename_1.nextFilename(destPath, originalname);
    const destFilePath = path_1.join(destPath, destName);
    const uriPath = path_1.join('/', rootPath(fileData), destName);
    return { destPath, destName, destFilePath, uriPath };
};
//# sourceMappingURL=create.js.map