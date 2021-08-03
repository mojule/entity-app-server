import { DbCollection, DbItem } from '@mojule/entity-app';
import { DbRemoteReadOptions } from './types';
export declare const createCollection: <TEntityMap, K extends keyof TEntityMap, D extends DbItem>(key: K, options: DbRemoteReadOptions) => DbCollection<TEntityMap[K], D>;
