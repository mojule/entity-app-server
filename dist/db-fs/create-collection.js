"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollection = void 0;
const fs_1 = require("fs");
const entity_app_1 = require("@mojule/entity-app");
const { readFile, writeFile, readdir, unlink, stat } = fs_1.promises;
const createCollection = (path, createDbItem, formatJson) => {
    const stringify = (formatJson ?
        (value) => JSON.stringify(value, null, 2) :
        (value) => JSON.stringify(value));
    const filePath = (id) => `${path}/${id}.json`;
    const ids = async () => {
        const fileIds = (await readdir(path))
            .filter(s => s.endsWith('.json'))
            .map(s => s.replace(/\.json$/, ''));
        return fileIds;
    };
    const create = async (entity) => {
        const dbItem = createDbItem();
        const dbEntity = Object.assign(entity, dbItem);
        const json = stringify(dbEntity);
        await writeFile(filePath(dbItem._id), json, 'utf8');
        return dbItem._id;
    };
    const createMany = entity_app_1.defaultCreateMany(create);
    const load = async (id) => {
        const json = await readFile(filePath(id), 'utf8');
        const dbEntity = JSON.parse(json);
        return dbEntity;
    };
    const loadMany = entity_app_1.defaultLoadMany(load);
    const save = async (document) => {
        const { _id } = document;
        if (typeof _id !== 'string')
            throw Error('Expected document to have _id:string');
        // must exist
        await stat(filePath(_id));
        const json = stringify(document);
        await writeFile(filePath(_id), json, 'utf8');
    };
    const saveMany = entity_app_1.defaultSaveMany(save);
    const remove = async (id) => {
        await unlink(filePath(id));
    };
    const removeMany = entity_app_1.defaultRemoveMany(remove);
    const find = entity_app_1.defaultFind(ids, loadMany);
    const findOne = entity_app_1.defaultFindOne(ids, loadMany);
    const loadPaged = entity_app_1.defaultLoadPaged(ids, loadMany);
    const entityCollection = {
        ids, create, createMany, load, loadMany, save, saveMany, remove, removeMany,
        find, findOne, loadPaged
    };
    return entityCollection;
};
exports.createCollection = createCollection;
//# sourceMappingURL=create-collection.js.map