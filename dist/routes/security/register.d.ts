import { SecureDb, SecureEntityMap } from '@mojule/entity-app';
import { RegisterOptions } from './types';
import { Route } from '../types';
export declare const createSecurityRegisterRoutes: <EntityMap extends SecureEntityMap>(db: SecureDb<EntityMap, {
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
}>, options: RegisterOptions) => Promise<{
    register: Route<any>;
}>;
