"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRolesHandler = void 0;
const entity_app_1 = require("@mojule/entity-app");
const createRolesHandler = (requiredRoles) => {
    const handler = (req, _res, next) => {
        const user = req.user;
        let currentRoles = [];
        if (user && Array.isArray(user['roles'])) {
            currentRoles = user['roles'];
        }
        const isInRoles = entity_app_1.hasAllRoles(requiredRoles, currentRoles);
        if (!isInRoles) {
            const err = Error('User is not authorized to perform this action');
            next(err);
            return;
        }
        next();
    };
    return handler;
};
exports.createRolesHandler = createRolesHandler;
//# sourceMappingURL=roles-handler.js.map