import { StoreRoute, GetPath, GetResult } from './types';
import { DbCollection, EntitySchemaDb } from '@mojule/entity-app';
export declare const postRoute: <TEntityMap>(collectionKey: keyof TEntityMap, store: EntitySchemaDb<TEntityMap>, action: keyof import("@mojule/entity-app").DbCollectionRead<TEntityMap, import("@mojule/entity-app").DbItem> | keyof import("@mojule/entity-app").DbCollectionWrite<TEntityMap>, type: any, getPath?: GetPath, getResult?: GetResult<TEntityMap, any>) => StoreRoute<TEntityMap>;
