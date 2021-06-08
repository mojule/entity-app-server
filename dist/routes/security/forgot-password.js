"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSecurityForgotRoutes = void 0;
const bcrypt = require("bcryptjs");
const express_1 = require("express");
const uuid_1 = require("uuid");
const log_iisnode_1 = require("@mojule/log-iisnode");
const util_1 = require("@mojule/util");
const delay_handler_1 = require("../../delay-handler");
const entity_app_1 = require("@mojule/entity-app");
const postHandler = express_1.default.urlencoded({ extended: false });
const createSecurityForgotRoutes = async (db, options) => {
    const { changePasswordHandlers = [], notifyUserPasswordChange, notifyUserPasswordReset } = options;
    // routes - forgot - post email, reset - post new password
    const forgotPassword = {
        method: 'post',
        path: 'forgot-password',
        roles: [],
        handlers: [
            postHandler,
            delay_handler_1.delayHandler,
            async (req, res) => {
                const start = Date.now();
                try {
                    const { email } = req.body;
                    if (!email)
                        throw Error('Expected email');
                    const user = await db.collections.user.findOne({ email });
                    if (!user)
                        throw Error(`No user found for ${email}`);
                    const secret = uuid_1.v4();
                    const resetPassword = {
                        name: `Reset password for ${user.name}`,
                        secret,
                        user: { _collection: 'user', _id: user._id }
                    };
                    await db.collections.resetPassword.create(resetPassword);
                    await notifyUserPasswordReset(user, secret);
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
        roles: [],
        handlers: [
            delay_handler_1.delayHandler,
            async (req, res) => {
                const start = Date.now();
                const { secret } = req.params;
                try {
                    if (!secret)
                        throw Error('Expected secret');
                    const query = { secret };
                    const reset = await db.collections.resetPassword.findOne(query);
                    if (!reset)
                        throw Error(`Expected resetPassword for ${secret}`);
                    const { _id } = reset.user;
                    const user = await db.collections.user.load(_id);
                    await loginUser(req, user);
                    db.collections.resetPassword.remove(reset._id);
                }
                catch (err) {
                    log_iisnode_1.log.error(err);
                }
                const elapsed = Date.now() - start;
                await util_1.delayPromise(250 - elapsed);
                res.redirect('/change-password');
            }
        ]
    };
    const changePassword = {
        method: 'post',
        path: 'change-password',
        roles: [],
        handlers: [
            postHandler,
            delay_handler_1.delayHandler,
            ...changePasswordHandlers,
            async (req, res) => {
                const start = Date.now();
                let { password } = req.body;
                try {
                    if (!password)
                        throw Error('Expected password');
                    const { isStrong } = entity_app_1.testPassword(password);
                    if (!isStrong) {
                        throw Error('Expected strong password');
                    }
                    if (!req.isAuthenticated())
                        throw Error('Expected logged in user');
                    const { user: reqUser } = req;
                    if (!reqUser)
                        throw Error('Expected req.user');
                    const id = reqUser['_id'];
                    if (typeof id !== 'string')
                        throw Error('Expected user._id');
                    const user = await db.collections.user.load(id);
                    user.password = await bcrypt.hash(password, 10);
                    await db.collections.user.save(user);
                    await notifyUserPasswordChange(user);
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