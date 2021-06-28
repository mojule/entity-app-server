"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollection = void 0;
const util_1 = require("@mojule/util");
const node_fetch_1 = require("node-fetch");
const handleResponse = async (res) => {
    const textResult = await res.text();
    // was OK but didn't return a body
    if (res.ok && textResult.trim() === '')
        return;
    const result = JSON.parse(textResult);
    if (res.ok)
        return result;
    const err = util_1.objToError(result);
    throw err;
};
const createCollection = (key, options) => {
    const { uri, auth } = options;
    const apiGet = async (key, action, ...args) => {
        const path = getPath(key, action, args);
        const response = await node_fetch_1.default(path);
        return handleResponse(response);
    };
    const getPath = (key, action, ...args) => {
        const keySlug = util_1.kebabCase(String(key));
        const actionSlug = util_1.kebabCase(action);
        const argSlugs = args.map(arg => String(arg));
        const getPath = [uri, keySlug, actionSlug, ...argSlugs].join('/');
        return getPath;
    };
    const apiPost = async (key, action, arg, id) => {
        const json = JSON.stringify(arg);
        let path = `${uri}/${util_1.kebabCase(String(key))}/${util_1.kebabCase(action)}`;
        if (id) {
            path += `/${id}`;
        }
        const headers = {
            'Content-Type': 'application/json'
        };
        const options = {
            method: 'POST',
            headers,
            body: json
        };
        if (auth) {
            headers.Authorization = auth;
        }
        const response = await node_fetch_1.default(path, options);
        return handleResponse(response);
    };
    const ids = async () => apiGet(key, 'ids');
    const create = async (entity) => apiPost(key, 'create', entity);
    const createMany = async (entities) => apiPost(key, 'createMany', entities);
    const load = async (id) => apiGet(key, 'load', id);
    const loadMany = async (ids) => apiPost(key, 'loadMany', ids);
    const save = async (document) => apiPost(key, 'save', document);
    const saveMany = async (documents) => apiPost(key, 'saveMany', documents);
    const remove = async (id) => apiGet(key, 'remove', id);
    const removeMany = async (ids) => apiPost(key, 'removeMany', ids);
    const find = async (criteria) => apiPost(key, 'find', criteria);
    const findOne = async (criteria) => apiPost(key, 'findOne', criteria);
    const loadPaged = async (pageSize, pageIndex = 0) => apiGet(key, 'loadPaged', pageSize, pageIndex);
    const entityCollection = {
        ids, create, createMany, load, loadMany, save, saveMany, remove, removeMany,
        find, findOne, loadPaged
    };
    return entityCollection;
};
exports.createCollection = createCollection;
//# sourceMappingURL=create-collection.js.map