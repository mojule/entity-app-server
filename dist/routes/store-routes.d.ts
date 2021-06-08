import { Request } from 'express-serve-static-core';
import { ActionType, DbCollection, DbItem, EntityKeys, EntitySchemaDb } from '@mojule/entity-app';
import { StoreRoute } from './types';
export declare const createStoreRoutes: <TEntityMap>(store: EntitySchemaDb<TEntityMap>, keys: EntityKeys<TEntityMap>, apiPrefix?: string, readOnly?: boolean) => StoreRoute<TEntityMap>[];
export declare const createCollectionRoutes: <TEntityMap>(collectionKey: keyof TEntityMap, store: EntitySchemaDb<TEntityMap>, readOnly: boolean) => StoreRoute<TEntityMap>[];
export declare const defaultGetPath: (collectionSlug: string, actionSlug: string, omitId?: boolean | undefined) => string;
export declare const defaultGetResult: <TEntityMap>(collectionKey: keyof TEntityMap, store: EntitySchemaDb<TEntityMap>, action: keyof DbCollection<TEntityMap>, type: ActionType, req: Request, omitId?: boolean | undefined) => Promise<string | void | string[] | never[] | (TEntityMap[keyof TEntityMap] & DbItem) | (TEntityMap[keyof TEntityMap] & DbItem)[]>;
export declare const defaultPostResult: <TEntityMap>(collectionKey: keyof TEntityMap, store: EntitySchemaDb<TEntityMap>, action: keyof DbCollection<TEntityMap>, type: ActionType, req: Request) => Promise<any>;
export declare const defaultPostPath: (collectionSlug: string, actionSlug: string) => string;
