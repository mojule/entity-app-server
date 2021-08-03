"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFsDb = void 0;
const entity_app_1 = require("@mojule/entity-app");
const util_1 = require("@mojule/util");
const create_collection_1 = require("./create-collection");
const fs_1 = require("fs");
const path_1 = require("path");
const { mkdir } = fs_1.promises;
const mkdirSafe = async (path, options) => {
    try {
        await mkdir(path, options);
    }
    catch (err) {
        if (err.code !== 'EEXIST')
            throw err;
    }
};
const initCollections = async (path, keys, createDbItem, formatJson = false) => {
    const collections = {};
    for (const key in keys) {
        const collectionPath = path_1.posix.join(path, key);
        await mkdirSafe(collectionPath);
        collections[key] = create_collection_1.createCollection(collectionPath, createDbItem, formatJson);
    }
    return collections;
};
const createFsDb = async (name, keys, createDbItem, { dataPath, formatJson } = { dataPath: './data/fs' }) => {
    name = util_1.kebabCase(name);
    const path = path_1.posix.join(dataPath, name);
    await mkdirSafe(path);
    const drop = async () => entity_app_1.defaultDrop(db)();
    const close = async () => { };
    const collections = await initCollections(path, keys, createDbItem, formatJson);
    const db = { drop, close, collections };
    return db;
};
exports.createFsDb = createFsDb;
//# sourceMappingURL=index.js.map