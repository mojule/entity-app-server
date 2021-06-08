"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRoutes = void 0;
const roles_handler_1 = require("../security/roles-handler");
const addRoutes = (app, passport, routes, log) => {
    routes.forEach(route => {
        const { method, path, handlers, roles } = route;
        let allHandlers = handlers;
        if (roles.length > 0) {
            allHandlers = [
                (req, _res, next) => {
                    log.info(`${req.path} requires roles`, roles);
                    next();
                },
                passport.authenticate('basic', { session: false }),
                (req, _res, next) => {
                    log.info('Post basic authentication, isAuthenticated', req.isAuthenticated());
                    next();
                },
                roles_handler_1.createRolesHandler(roles),
                ...handlers
            ];
        }
        app[method](path, ...allHandlers);
    });
};
exports.addRoutes = addRoutes;
//# sourceMappingURL=add-routes.js.map