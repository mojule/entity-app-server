import { CreateDbItem, DbItem, EntityDb, EntityKeys } from '@mojule/entity-app';
import { FsOptions } from './types';
export declare const createFsDb: <TEntityMap, D extends DbItem>(name: string, keys: EntityKeys<TEntityMap>, createDbItem: CreateDbItem<D>, { dataPath, formatJson }?: FsOptions) => Promise<EntityDb<TEntityMap, D>>;
