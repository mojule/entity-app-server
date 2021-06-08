"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRoute = void 0;
const express = require("express");
const util_1 = require("@mojule/util");
const error_handler_1 = require("./error-handler");
const store_routes_1 = require("./store-routes");
const schema_routes_1 = require("./schema-routes");
const postRoute = (collectionKey, store, action, type, getPath = store_routes_1.defaultPostPath, getResult = store_routes_1.defaultPostResult) => {
    const method = 'post';
    const collectionSlug = util_1.kebabCase(String(collectionKey));
    const actionSlug = util_1.kebabCase(String(action));
    const path = getPath(collectionSlug, actionSlug);
    const schemaHandler = schema_routes_1.createEntitySchemaRouteHandler(store, collectionKey, type);
    const handler = async (req, res) => {
        try {
            const result = await getResult(collectionKey, store, action, type, req);
            res.json(result);
        }
        catch (err) {
            error_handler_1.errorHandler(res, err);
        }
    };
    const handlers = [schemaHandler, express.json(), handler];
    const meta = {
        collectionKey, action
    };
    const route = {
        method, path, handlers, meta, roles: ['admin']
    };
    return route;
};
exports.postRoute = postRoute;
//# sourceMappingURL=post-route.js.map