"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoute = void 0;
const util_1 = require("@mojule/util");
const error_handler_1 = require("./error-handler");
const store_routes_1 = require("./store-routes");
const schema_routes_1 = require("./schema-routes");
const getRoute = (collectionKey, store, action, type, getPath = store_routes_1.defaultGetPath, getResult = store_routes_1.defaultGetResult, omitId = false) => {
    const method = 'get';
    const collectionSlug = util_1.kebabCase(String(collectionKey));
    const actionSlug = util_1.kebabCase(String(action));
    const path = getPath(collectionSlug, actionSlug, omitId);
    const schemaHandler = schema_routes_1.createEntitySchemaRouteHandler(store, collectionKey, type);
    const handler = async (req, res) => {
        try {
            const result = await getResult(collectionKey, store, action, type, req, omitId);
            res.json(result);
        }
        catch (err) {
            error_handler_1.errorHandler(res, err);
        }
    };
    const handlers = [schemaHandler, handler];
    const meta = {
        collectionKey, action
    };
    // TODO - GET should actually respect _esRoles.read in schema
    const route = {
        method, path, handlers, meta, roles: []
    };
    return route;
};
exports.getRoute = getRoute;
//# sourceMappingURL=get-route.js.map