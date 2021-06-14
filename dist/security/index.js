"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSecurity = void 0;
const bcrypt = require("bcryptjs");
const uuid_1 = require("uuid");
const entity_app_1 = require("@mojule/entity-app");
const createSecurity = (store, log) => {
    const strategy = (email, password, done) => {
        log.info('Password strategy');
        store.collections.user.findOne({ email })
            .then(user => {
            if (user === undefined) {
                log.info(`No User for email ${email}`);
                return done(null, false);
            }
            //console.log('User', Object.assign({}, user, { password: '<secret>' }))
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    log.warn('Error while comparing password');
                    log.error(err);
                    return done(err);
                }
                if (!result) {
                    log.warn('Invalid password attempt');
                    return done(null, false);
                }
                return done(null, user);
            });
        })
            .catch(err => {
            log.error(err);
            done(err);
        });
    };
    const serializeUser = (user, cb) => {
        cb(null, user._id);
    };
    const deserializeUser = (_id, cb) => {
        store.collections.user.load(_id)
            .then(user => {
            const { name, email, roles } = user;
            user.roles.push(entity_app_1.Roles.currentUser);
            cb(null, { _id, name, email, roles });
        })
            .catch(err => {
            cb(err);
        });
    };
    const apiKeyStrategy = (id, secret, done) => {
        log.info('API Key strategy', id);
        store.collections.apiKey.load(id)
            .then(async (apiKey) => {
            log.info('API Key found');
            const result = await bcrypt.compare(secret, apiKey.secret);
            if (!result) {
                log.warn('Key did not match');
                done(null, false);
                return;
            }
            const { _id } = apiKey.user;
            const user = await store.collections.user.load(_id);
            done(null, user);
        })
            .catch(err => {
            log.error(err);
            done(err);
        });
    };
    const createApiKey = async (user, tags) => {
        const uuid = uuid_1.v4();
        const secret = await bcrypt.hash(uuid, 10);
        const apiKey = {
            name: 'API Key for ' + user.name,
            user: {
                _id: user._id,
                _collection: 'user'
            },
            secret,
            tags
        };
        const id = await store.collections.apiKey.create(apiKey);
        const basicAuth = Buffer.from(`${id}:${uuid}`).toString('base64');
        return { basicAuth, id };
    };
    const getSessionApiKeyBasicAuth = async (req) => {
        const { session } = req;
        if (session.apiKeyBasicAuth)
            return session.apiKeyBasicAuth;
        const user = req['user'];
        if (!user)
            throw Error('No user!');
        if (!user._id)
            throw Error('No _id on user');
        const sessionApis = await store.collections.apiKey.find({
            'user._id': user._id,
            tags: 'session'
        });
        await Promise.all(sessionApis.map(sessionApi => store.collections.apiKey.remove(sessionApi._id)));
        const userEntity = await store.collections.user.load(user._id);
        const apiKey = await createApiKey(userEntity, ['session']);
        session.apiKeyBasicAuth = apiKey.basicAuth;
        return session.apiKeyBasicAuth;
    };
    return {
        strategy, serializeUser, deserializeUser, apiKeyStrategy, createApiKey,
        getSessionApiKeyBasicAuth
    };
};
exports.createSecurity = createSecurity;
//# sourceMappingURL=index.js.map