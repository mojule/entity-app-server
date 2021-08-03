"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRoutes = void 0;
const mode_1 = require("@mojule/mode");
const create_route_access_1 = require("./create-route-access");
const addRoutes = (app, passport, routes, isUserInGroup, log) => {
    routes.forEach(route => {
        const { method, path, handlers, access } = route;
        let allHandlers = handlers;
        if (access.require) {
            const r = mode_1.hasRequestBit(access.require, 'r') ? 'r' : '-';
            const w = mode_1.hasRequestBit(access.require, 'w') ? 'w' : '-';
            const x = mode_1.hasRequestBit(access.require, 'x') ? 'x' : '-';
            allHandlers = [
                (req, _res, next) => {
                    log.info(`${req.path} requires access`, [r, w, x].join(''));
                    next();
                },
                passport.authenticate('basic', { session: false }),
                (req, _res, next) => {
                    log.info('Post basic authentication, isAuthenticated', req.isAuthenticated());
                    next();
                },
                create_route_access_1.createRouteAccessHandler(route.access, isUserInGroup),
                ...handlers
            ];
        }
        app[method](path, ...allHandlers);
    });
};
exports.addRoutes = addRoutes;
//# sourceMappingURL=add-routes.js.map