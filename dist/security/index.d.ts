import { Request } from 'express-serve-static-core';
import { Logger } from '@mojule/log-formatter/src/types';
import { DbItem, EntityDb, SecurityEntityMap, UserData, UserEntity } from '@mojule/entity-app';
export declare const createSecurity: (store: EntityDb<SecurityEntityMap>, log: Logger) => {
    strategy: (email: string, password: string, done: any) => void;
    serializeUser: (user: UserEntity & DbItem, cb: any) => void;
    deserializeUser: (_id: string, cb: (arg0: null | Error, arg1?: any) => void) => void;
    apiKeyStrategy: (id: string, secret: string, done: (arg0: any, arg1?: boolean | (UserEntity & DbItem)) => void) => void;
    createApiKey: (user: UserEntity & DbItem, tags?: string[] | undefined) => Promise<{
        basicAuth: string;
        id: string;
    }>;
    getSessionApiKeyBasicAuth: (req: Request) => Promise<string>;
};
