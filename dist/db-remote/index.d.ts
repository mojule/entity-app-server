import { EntityDb, EntityKeys } from '@mojule/entity-app';
import { DbRemoteReadOptions } from './types';
export declare const creatRemoteStore: <TEntityMap>(_name: string, keys: EntityKeys<TEntityMap>, options: DbRemoteReadOptions) => Promise<EntityDb<TEntityMap>>;
