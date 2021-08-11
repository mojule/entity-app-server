"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRoutes = void 0;
const create_route_access_1 = require("./create-route-access");
const addRoutes = (app, passport, routes, isUserInGroup, log) => {
    routes.forEach(route => {
        const { method, path, handlers, access } = route;
        let allHandlers = handlers;
        if (access) {
            allHandlers = [
                (req, _res, next) => {
                    log.info(`${req.path} requires access ${access.require}`);
                    next();
                },
                passport.authenticate('basic', { session: false }),
                (req, _res, next) => {
                    log.info('Post basic authentication, isAuthenticated', req.isAuthenticated());
                    next();
                },
                create_route_access_1.createRouteAccessHandler(access, isUserInGroup),
                ...handlers
            ];
        }
        else {
            log.info(`${method} ${path} has no access requirement`);
        }
        app[method](path, ...allHandlers);
    });
};
exports.addRoutes = addRoutes;
//# sourceMappingURL=add-routes.js.map