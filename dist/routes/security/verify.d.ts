import { EntityDb, SecurityEntityMap } from '@mojule/entity-app';
import { Route } from '../types';
export declare const createSecurityVerifyRoutes: <EntityMap extends SecurityEntityMap>(db: EntityDb<EntityMap>) => Promise<{
    verify: Route<any>;
}>;
