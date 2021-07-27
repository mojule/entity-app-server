import { Route } from '../types';
import { ForgotPasswordOptions } from './types';
import { DbItem, EntityDb, SecurityEntityMap } from '@mojule/entity-app';
export declare const createSecurityForgotRoutes: <EntityMap extends SecurityEntityMap>(db: EntityDb<EntityMap, DbItem>, options: ForgotPasswordOptions) => Promise<{
    forgotPassword: Route<any>;
    resetPassword: Route<any>;
    changePassword: Route<any>;
}>;
