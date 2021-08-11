"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSecurityRegisterRoutes = void 0;
const express = require("express");
const entity_app_1 = require("@mojule/entity-app");
const util_1 = require("@mojule/util");
const log_iisnode_1 = require("@mojule/log-iisnode");
const delay_handler_1 = require("../../delay-handler");
const postHandler = express.urlencoded({ extended: false });
const createSecurityRegisterRoutes = async (db, options) => {
    const { registerHandlers = [], notifyUserVerifyEmail } = options;
    const register = {
        method: 'post',
        path: 'register',
        handlers: [
            // check password strength again
            // generate a secret
            // create a pendingUser
            // send email
            postHandler,
            delay_handler_1.delayHandler,
            ...registerHandlers,
            async (req, res) => {
                const start = Date.now();
                try {
                    if (req.isAuthenticated()) {
                        throw Error('User already logged in while registering');
                    }
                    const { name, password } = req.body;
                    const { isStrong } = entity_app_1.testPassword(password);
                    if (!isStrong) {
                        throw Error('Expected strong password');
                    }
                    const existingUsers = await db.userNames();
                    if (existingUsers.includes(name)) {
                        throw Error(`User named ${name} already exists`);
                    }
                    const secret = await db.account.createPendingUser({ name, password });
                    await notifyUserVerifyEmail(name, secret);
                }
                catch (err) {
                    log_iisnode_1.log.error(err);
                }
                const elapsed = Date.now() - start;
                await util_1.delayPromise(250 - elapsed);
                res.redirect('/verify-sent');
            }
        ]
    };
    return { register };
};
exports.createSecurityRegisterRoutes = createSecurityRegisterRoutes;
//# sourceMappingURL=register.js.map