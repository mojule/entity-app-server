"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSecurityVerifyRoutes = void 0;
const log_iisnode_1 = require("@mojule/log-iisnode");
const util_1 = require("@mojule/util");
const delay_handler_1 = require("../../delay-handler");
const createSecurityVerifyRoutes = async (db) => {
    const verify = {
        method: 'get',
        path: 'verify/:secret',
        roles: [],
        handlers: [
            delay_handler_1.delayHandler,
            async (req, res) => {
                const start = Date.now();
                const { secret } = req.params;
                try {
                    if (!secret)
                        throw Error('Expected secret');
                    await db.account.verifyPendingUser(secret);
                }
                catch (err) {
                    log_iisnode_1.log.error(err);
                }
                const elapsed = Date.now() - start;
                await util_1.delayPromise(250 - elapsed);
                res.redirect('/verify-success');
            }
        ]
    };
    return { verify };
};
exports.createSecurityVerifyRoutes = createSecurityVerifyRoutes;
//# sourceMappingURL=verify.js.map