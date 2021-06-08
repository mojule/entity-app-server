/// <reference types="qs" />
import { RequestHandler } from 'express';
import { ActionType, EntitySchemaDb, EntitySchemaMap } from '@mojule/entity-app';
import { SchemaRoute } from './types';
export declare const createSchemaRoutes: <TEntityMap>(schemaMap: import("@mojule/util").KeyValueMap<TEntityMap, import("@mojule/entity-app").IdSchema>) => SchemaRoute<TEntityMap>[];
export declare const createEntitySchemaRouteHandler: <TEntityMap>(store: EntitySchemaDb<TEntityMap>, collectionKey: keyof TEntityMap, type: ActionType) => RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
