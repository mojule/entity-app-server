import { StoreRoute, GetPath, GetResult } from './types';
import { ActionType, DbCollection, EntitySchemaDb } from '@mojule/entity-app';
export declare const postRoute: <TEntityMap>(collectionKey: keyof TEntityMap, store: EntitySchemaDb<TEntityMap>, action: keyof DbCollection<TEntityMap>, type: ActionType, getPath?: GetPath, getResult?: GetResult<TEntityMap, any>) => StoreRoute<TEntityMap>;
