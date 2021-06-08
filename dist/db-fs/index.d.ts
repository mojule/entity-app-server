import { EntityDb, EntityKeys } from '@mojule/entity-app';
import { FsOptions } from './types';
export declare const createFsDb: <TEntityMap>(name: string, keys: EntityKeys<TEntityMap>, { dataPath }?: FsOptions) => Promise<EntityDb<TEntityMap>>;