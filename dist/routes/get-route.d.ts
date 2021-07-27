import { DbCollection, EntitySchemaDb } from '@mojule/entity-app';
import { StoreRoute, GetPath, GetResult } from './types';
export declare const getRoute: <TEntityMap>(collectionKey: keyof TEntityMap, store: EntitySchemaDb<TEntityMap>, action: keyof import("@mojule/entity-app").DbCollectionRead<TEntityMap, import("@mojule/entity-app").DbItem> | keyof import("@mojule/entity-app").DbCollectionWrite<TEntityMap>, type: any, getPath?: GetPath, getResult?: GetResult<TEntityMap, any>, omitId?: boolean) => StoreRoute<TEntityMap>;
