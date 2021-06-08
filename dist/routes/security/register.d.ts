import { EntityDb, SecurityEntityMap } from '@mojule/entity-app';
import { RegisterOptions } from './types';
import { Route } from '../types';
export declare const createSecurityRegisterRoutes: <EntityMap extends SecurityEntityMap>(db: EntityDb<EntityMap>, options: RegisterOptions) => Promise<{
    register: Route<any>;
}>;
