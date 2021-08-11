import { StoreRoute, GetPath, GetResult } from './types';
import { DbCollection, EntitySchemaDb } from '@mojule/entity-app';
export declare const postStoreRoute: <TEntityMap>(collectionKey: keyof TEntityMap, store: EntitySchemaDb<TEntityMap>, action: keyof import("@mojule/entity-app").DbCollectionRead<TEntityMap, import("@mojule/entity-app").DbItem> | keyof import("@mojule/entity-app").DbCollectionWrite<TEntityMap>, getPath?: GetPath, getResult?: GetResult<TEntityMap, any>) => StoreRoute<TEntityMap>;
