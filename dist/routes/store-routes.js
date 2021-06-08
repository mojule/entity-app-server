"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultPostPath = exports.defaultPostResult = exports.defaultGetResult = exports.defaultGetPath = exports.createCollectionRoutes = exports.createStoreRoutes = void 0;
const entity_app_1 = require("@mojule/entity-app");
const util_1 = require("@mojule/util");
const post_route_1 = require("./post-route");
const get_route_1 = require("./get-route");
const createStoreRoutes = (store, keys, apiPrefix = '/api/v1/', readOnly = false) => {
    const routes = [];
    entity_app_1.eachEntityKeySync(keys, key => {
        const collectionRoutes = exports.createCollectionRoutes(key, store, readOnly);
        routes.push(...collectionRoutes);
    });
    routes.forEach(route => route.path = `${apiPrefix}${route.path}`);
    return routes;
};
exports.createStoreRoutes = createStoreRoutes;
const createCollectionRoutes = (collectionKey, store, readOnly) => {
    const storeRouteData = {
        ids: {
            method: 'get',
            omitId: true,
            type: 'read'
        },
        create: {
            method: 'post',
            type: 'create'
        },
        createMany: {
            method: 'post',
            type: 'create'
        },
        load: {
            method: 'get',
            type: 'read'
        },
        loadMany: {
            method: 'post',
            type: 'read'
        },
        save: {
            method: 'post',
            type: 'update'
        },
        saveMany: {
            method: 'post',
            type: 'update'
        },
        remove: {
            method: 'get',
            type: 'delete'
        },
        removeMany: {
            method: 'post',
            type: 'delete'
        },
        find: {
            method: 'post',
            type: 'read'
        },
        findOne: {
            method: 'post',
            type: 'read'
        },
        loadPaged: {
            method: 'get',
            getPath: (collectionSlug, actionSlug) => `${collectionSlug}/${actionSlug}/:pageSize/:pageIndex?`,
            getResult: async (collectionKey, store, action, type, req) => {
                const collection = store.collections[collectionKey];
                const exec = collection[action];
                const pageSize = Number(req.params.pageSize);
                const pageIndex = (req.params.pageIndex ?
                    Number(req.params.pageIndex) : 0);
                const result = await exec(pageSize, pageIndex);
                return handleResolve(result, store, req);
            },
            type: 'read'
        }
    };
    const routes = [];
    util_1.eachKeyValueMap(storeRouteData, (config, action) => {
        if (config === undefined)
            throw Error(`The route config at ${action} was undefined`);
        const { getPath, getResult, type } = config;
        if (readOnly && type !== 'read')
            return;
        const route = (config.method === 'post' ?
            post_route_1.postRoute(collectionKey, store, action, type, getPath, getResult) :
            get_route_1.getRoute(collectionKey, store, action, type, getPath, getResult, config.omitId));
        routes.push(route);
    });
    return routes;
};
exports.createCollectionRoutes = createCollectionRoutes;
const defaultGetPath = (collectionSlug, actionSlug, omitId) => `${collectionSlug}/${actionSlug}${omitId ? '' : '/:id'}`;
exports.defaultGetPath = defaultGetPath;
const defaultGetResult = async (collectionKey, store, action, type, req, omitId) => {
    const collection = store.collections[collectionKey];
    const exec = collection[action];
    const result = (omitId ?
        await exec() :
        await exec(req.params.id));
    return handleResolve(result, store, req);
};
exports.defaultGetResult = defaultGetResult;
const defaultPostResult = async (collectionKey, store, action, type, req) => {
    const arg = req.body;
    const collection = store.collections[collectionKey];
    const result = await collection[action](arg);
    return handleResolve(result, store, req);
};
exports.defaultPostResult = defaultPostResult;
const defaultPostPath = (collectionSlug, actionSlug) => `${collectionSlug}/${actionSlug}`;
exports.defaultPostPath = defaultPostPath;
const isEntity = (value) => value && value['_id'];
const isEntityArray = (value) => Array.isArray(value) && isEntity(value[0]);
const handleResolve = async (result, store, req) => {
    const { resolve } = req.query;
    if (resolve === 'shallow') {
        if (isEntityArray(result)) {
            return Promise.all(result.map(e => entity_app_1.resolveRefsShallow(store, e)));
        }
        if (isEntity(result)) {
            return entity_app_1.resolveRefsShallow(store, result);
        }
    }
    if (resolve === 'deep') {
        if (isEntityArray(result)) {
            return Promise.all(result.map(e => entity_app_1.resolveRefsDeep(store, e)));
        }
        if (isEntity(result)) {
            return entity_app_1.resolveRefsDeep(store, result);
        }
    }
    return result;
};
//# sourceMappingURL=store-routes.js.map