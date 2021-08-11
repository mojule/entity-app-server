"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postStoreRoute = void 0;
const express = require("express");
const util_1 = require("@mojule/util");
const error_handler_1 = require("./error-handler");
const store_routes_1 = require("./store-routes");
const postStoreRoute = (collectionKey, store, action, getPath = store_routes_1.defaultPostPath, getResult = store_routes_1.defaultPostResult) => {
    const method = 'post';
    const collectionSlug = util_1.kebabCase(String(collectionKey));
    const actionSlug = util_1.kebabCase(String(action));
    const path = getPath(collectionSlug, actionSlug);
    const handler = async (req, res) => {
        try {
            const result = await getResult(collectionKey, store, action, req);
            res.json(result);
        }
        catch (err) {
            error_handler_1.errorHandler(res, err);
        }
    };
    const handlers = [express.json(), handler];
    const meta = {
        collectionKey, action
    };
    const route = {
        method, path, handlers, meta
    };
    return route;
};
exports.postStoreRoute = postStoreRoute;
//# sourceMappingURL=post-route.js.map