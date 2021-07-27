import { EntityDb, EntityKeys } from '@mojule/entity-app';
import { FsOptions } from './types';
export declare const createFsDb: <TEntityMap>(name: string, keys: EntityKeys<TEntityMap>, { dataPath, formatJson }?: FsOptions) => Promise<EntityDb<TEntityMap, import("@mojule/entity-app").DbItem>>;
