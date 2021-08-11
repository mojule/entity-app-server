"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRouteAccessHandler = void 0;
const mode_1 = require("@mojule/mode");
const createRouteAccessHandler = (access, isUserInGroup) => {
    const handler = async (req, _res, next) => {
        const name = req.user ? req.user['name'] : 'nobody';
        const options = {
            isDirectory: access.isDirectory,
            isRoot: await isUserInGroup(name, 'root'),
            isOwner: name === access.owner,
            isGroup: await isUserInGroup(name, access.group),
            permissions: mode_1.parseSymbolicNotation(access.permissions)
        };
        // is there a method for this already?
        const accessKeys = access.require.split('').filter(s => s !== '-');
        const request = accessKeys.reduce((req, key) => req | mode_1.accessMasks[key], 0);
        if (mode_1.canAccess(request, options)) {
            return next();
        }
        next(Error('Eperm'));
    };
    return handler;
};
exports.createRouteAccessHandler = createRouteAccessHandler;
//# sourceMappingURL=create-route-access.js.map