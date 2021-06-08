import { Route } from '../types';
import { ForgotPasswordOptions } from './types';
import { EntityDb, SecurityEntityMap } from '@mojule/entity-app';
export declare const createSecurityForgotRoutes: <EntityMap extends SecurityEntityMap>(db: EntityDb<EntityMap>, options: ForgotPasswordOptions) => Promise<{
    forgotPassword: Route<any>;
    resetPassword: Route<any>;
    changePassword: Route<any>;
}>;
