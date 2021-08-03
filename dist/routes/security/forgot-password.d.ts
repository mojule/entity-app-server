import { Route } from '../types';
import { ForgotPasswordOptions } from './types';
import { SecureDb, SecureEntityMap } from '@mojule/entity-app';
export declare const createSecurityForgotRoutes: <EntityMap extends SecureEntityMap>(db: SecureDb<EntityMap, {
    [x: string]: unknown;
    _id: string;
    _atime: number;
    _ctime: number;
    _mtime: number;
    _ver: number;
    _mode: number;
    _owner: {
        [x: string]: unknown;
        _id: string;
        _collection: "user";
    };
    _group: {
        [x: string]: unknown;
        _id: string;
        _collection: "group";
    };
}>, options: ForgotPasswordOptions) => Promise<{
    forgotPassword: Route<any>;
    resetPassword: Route<any>;
    changePassword: Route<any>;
}>;
