"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatRemoteStore = void 0;
const entity_app_1 = require("@mojule/entity-app");
const create_collection_1 = require("./create-collection");
const initCollections = (keys, options) => {
    const collections = {};
    entity_app_1.eachEntityKeySync(keys, key => {
        collections[key] =
            create_collection_1.createCollection(key, options);
    });
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