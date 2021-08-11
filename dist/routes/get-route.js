"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreRoute = void 0;
const util_1 = require("@mojule/util");
const error_handler_1 = require("./error-handler");
const store_routes_1 = require("./store-routes");
const getStoreRoute = (collectionKey, store, action, getPath = store_routes_1.defaultGetPath, getResult = store_routes_1.defaultGetResult, omitId = false) => {
    const method = 'get';
    const collectionSlug = util_1.kebabCase(String(collectionKey));
    const actionSlug = util_1.kebabCase(String(action));
    const path = getPath(collectionSlug, actionSlug, omitId);
    const handler = async (req, res) => {
        try {
            const result = await getResult(collectionKey, store, action, req, omitId);
            res.json(result);
        }
        catch (err) {
            error_handler_1.errorHandler(res, err);
        }
    };
    const handlers = [handler];
    const meta = {
        collectionKey, action
    };
    const route = {
        method, path, handlers, meta
    };
    return route;
};
exports.getStoreRoute = getStoreRoute;
//# sourceMappingURL=get-route.js.map