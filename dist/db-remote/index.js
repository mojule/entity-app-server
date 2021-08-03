"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatRemoteStore = void 0;
const create_collection_1 = require("./create-collection");
const initCollections = (keys, options) => {
    const collections = {};
    for (const key in keys) {
        const collection = create_collection_1.createCollection(key, options);
        collections[key] = collection;
    }
    return collections;
};
const creatRemoteStore = async (_name, keys, options) => {
    const drop = async () => { };
    const close = async () => { };
    const collections = initCollections(keys, options);
    const db = { drop, close, collections };
    return db;
};
exports.creatRemoteStore = creatRemoteStore;
//# sourceMappingURL=index.js.map