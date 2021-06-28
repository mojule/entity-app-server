"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorateDbFileRemove = void 0;
const remove_files_1 = require("./remove-files");
const decorateDbFileRemove = (db, rootPath, keys = ['zipFile', 'file', 'imageFile'], unlinkZipChildren = true, log = () => { }) => {
    const { removeMany: originalFileRemoveMany } = db.collections.file;
    const { removeMany: originalImageRemoveMany } = db.collections.imageFile;
    const removeZipChildrenFromDb = async (entity) => {
        const fileIds = entity.files.map(r => r._id);
        const imageIds = entity.images.map(r => r._id);
        await originalFileRemoveMany(fileIds);
        await originalImageRemoveMany(imageIds);
    };
    const decorateRemoveZips = () => {
        const collection = db.collections.zipFile;
        const { remove: originalRemove, removeMany: originalRemoveMany } = collection;
        const remove = async (id) => {
            log('DB files remove entity from', 'zip');
            const entity = await collection.load(id);
            log('DB files remove zip file from', 'zip');
            await remove_files_1.removeZipFs(entity, rootPath, unlinkZipChildren);
            if (unlinkZipChildren) {
                log('DB files remove zip children from', 'zip');
                await removeZipChildrenFromDb(entity);
            }
            await originalRemove(id);
        };
        const removeMany = async (ids) => {
            log('DB files remove many entities from', 'zip');
            const entities = await collection.loadMany(ids);
            for (const zip of entities) {
                log('DB files remove zip file from', 'zip');
                await remove_files_1.removeZipFs(zip, rootPath, unlinkZipChildren);
                if (unlinkZipChildren) {
                    log('DB files remove zip children from', 'zip');
                    await removeZipChildrenFromDb(zip);
                }
            }
            await originalRemoveMany(ids);
        };
        Object.assign(collection, { remove, removeMany });
    };
    const decorateRemove = (key) => {
        const collection = db.collections[key];
        const { remove: originalRemove, removeMany: originalRemoveMany } = collection;
        const remove = async (id) => {
            log('DB files remove from', key);
            const entity = await collection.load(id);
            log('DB files removing file from', key);
            await remove_files_1.removeFs(entity, rootPath);
            await originalRemove(id);
        };
        const removeMany = async (ids) => {
            log('DB files removing many entities from', key);
            const entities = await collection.loadMany(ids);
            for (const entity of entities) {
                log('DB files removing many files from', key);
                remove_files_1.removeFs(entity, rootPath);
            }
            await originalRemoveMany(ids);
        };
        Object.assign(collection, { remove, removeMany });
    };
    keys.forEach(key => (key === 'zipFile' ?
        decorateRemoveZips() :
        decorateRemove(key)));
    const originalDrop = db.drop;
    const drop = async () => {
        log('DB files drop');
        // ensure we remove files if the db implementation drops directly
        for (const key of keys) {
            const collection = db.collections[key];
            const ids = await collection.ids();
            log('DB files dropping', key);
            await collection.removeMany(ids);
        }
        log('DB with files calling original drop');
        await originalDrop();
    };
    Object.assign(db, { drop });
};
exports.decorateDbFileRemove = decorateDbFileRemove;
//# sourceMappingURL=decorate-db-file-remove.js.map