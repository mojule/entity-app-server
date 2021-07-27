import { DbCollection } from '@mojule/entity-app';
import { DbRemoteReadOptions } from './types';
export declare const createCollection: <TEntityMap, K extends keyof TEntityMap>(key: K, options: DbRemoteReadOptions) => DbCollection<TEntityMap[K], import("@mojule/entity-app").DbItem>;
