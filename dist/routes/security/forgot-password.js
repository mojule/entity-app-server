"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSecurityForgotRoutes = void 0;
const express = require("express");
const log_iisnode_1 = require("@mojule/log-iisnode");
const util_1 = require("@mojule/util");
const delay_handler_1 = require("../../delay-handler");
const entity_app_1 = require("@mojule/entity-app");
const postHandler = express.urlencoded({ extended: false });
const createSecurityForgotRoutes = async (db, options) => {
    const { changePasswordHandlers = [], notifyUserPasswordChange, notifyUserPasswordReset } = options;
    const forgotPassword = {
        method: 'post',
        path: 'forgot-password',
        handlers: [
            postHandler,
            delay_handler_1.delayHandler,
            async (req, res) => {
                const start = Date.now();
                try {
                    const { name } = req.body;
                    if (!name)
                        throw Error('Expected name');
                    const secret = await db.account.forgotPassword(name);
                    await notifyUserPasswordReset(name, secret);
                }
                catch (err) {
                    log_iisnode_1.log.error(err);
                }
                const elapsed = Date.now() - start;
                await util_1.delayPromise(250 - elapsed);
                res.redirect('/forgot-sent');
            }
        ]
    };
    const loginUser = (req, user) => new Promise((resolve, reject) => {
        req.login(user, err => {
            if (err)
                return reject(err);
            resolve();
        });
    });
    const resetPassword = {
        method: 'get',
        path: 'reset-password/:secret',
        handlers: [
            delay_handler_1.delayHandler,
            async (req, res) => {
                const start = Date.now();
                const { secret } = req.params;
                try {
                    if (!secret)
                        throw Error('Expected secret');
                    const userName = await db.account.userForSecret(secret, 'forgot-password');
                    await loginUser(req, { name: userName });
                }
                catch (err) {
                    log_iisnode_1.log.error(err);
                }
                const elapsed = Date.now() - start;
                await util_1.delayPromise(250 - elapsed);
                res.redirect(`/change-password?secret=${secret}`);
            }
        ]
    };
    const changePassword = {
        method: 'post',
        path: 'change-password',
        handlers: [
            postHandler,
            delay_handler_1.delayHandler,
            ...changePasswordHandlers,
            async (req, res) => {
                const start = Date.now();
                let { secret, password } = req.body;
                try {
                    if (!secret)
                        throw Error('Expected secret');
                    if (!password)
                        throw Error('Expected password');
                    const { isStrong } = entity_app_1.testPassword(password);
                    if (!isStrong) {
                        throw Error('Expected strong password');
                    }
                    if (!req.isAuthenticated())
                        throw Error('Expected logged in user');
                    await db.account.resetPassword(secret, password);
                    const { user: reqUser } = req;
                    if (!reqUser)
                        throw Error('Expected req.user');
                    const name = reqUser['name'];
                    await notifyUserPasswordChange(name);
                }
                catch (err) {
                    log_iisnode_1.log.error(err);
                }
                const elapsed = Date.now() - start;
                await util_1.delayPromise(250 - elapsed);
                res.redirect('/password-changed');
            }
        ]
    };
    return { forgotPassword, resetPassword, changePassword };
};
exports.createSecurityForgotRoutes = createSecurityForgotRoutes;
//# sourceMappingURL=forgot-password.js.map