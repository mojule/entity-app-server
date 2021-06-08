"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEntitySchemaRouteHandler = exports.createSchemaRoutes = void 0;
const entity_app_1 = require("@mojule/entity-app");
const util_1 = require("@mojule/util");
const createSchemaRoutes = (schemaMap) => {
    const routes = [];
    util_1.eachKeyValueMap(schemaMap, (schema, collectionKey) => {
        const method = 'get';
        const path = `/schema/${util_1.kebabCase(collectionKey)}`;
        const handler = (_req, res) => res.json(schema);
        const handlers = [handler];
        const meta = { collectionKey };
        const route = {
            method, path, handlers, meta, roles: []
        };
        if (schema['_esRoles'] &&
            Array.isArray(schema['_esRoles']['read'])) {
            const schemaReadRoles = schema['_esRoles']['read'];
            route.roles = schemaReadRoles;
        }
        routes.push(route);
    });
    return routes;
};
exports.createSchemaRoutes = createSchemaRoutes;
const createEntitySchemaRouteHandler = (store, collectionKey, type) => {
    const handler = async (req, res, next) => {
        const { user } = req;
        const currentRoles = [];
        if (user && Array.isArray(user['roles'])) {
            currentRoles.push(...user['roles']);
        }
        const schemaMap = await store.getAllSchema();
        const schemaId = `#/${util_1.kebabCase(collectionKey)}`;
        const schema = schemaMap[schemaId];
        if (schema === undefined) {
            const err = Error(`No schema found with $id ${schemaId}`);
            next(err);
            return;
        }
        if (!entity_app_1.canAccessSchema(schema, type, currentRoles)) {
            res.status(403).send('403 Forbidden');
            return;
        }
        next();
    };
    return handler;
};
exports.createEntitySchemaRouteHandler = createEntitySchemaRouteHandler;
//# sourceMappingURL=schema-routes.js.map