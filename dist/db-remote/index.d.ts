import { DbItem, EntityDb, EntityKeys } from '@mojule/entity-app';
import { DbRemoteReadOptions } from './types';
export declare const creatRemoteStore: <TEntityMap, D extends DbItem = DbItem>(_name: string, keys: EntityKeys<TEntityMap>, options: DbRemoteReadOptions) => Promise<EntityDb<TEntityMap, D>>;
