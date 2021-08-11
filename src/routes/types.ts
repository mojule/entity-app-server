import { RequestHandler, Application } from 'express'
import { Request } from 'express-serve-static-core'
import { NullablePerms, SymbolicNotation } from '@mojule/mode'

import {
  DbCollection, EntitySchemaDb
} from '@mojule/entity-app'

export type Route<TMeta = any> = {
  method: Method
  path: string
  handlers: RequestHandler[]
  meta?: TMeta
  access?: RouteAccess
}

export type RouteAccess = {
  owner: string
  group: string
  permissions: SymbolicNotation
  require: ActionType
  isDirectory: boolean
}

export type CollectionRouteMeta<TEntityMap> = {
  collectionKey: keyof TEntityMap
}

export type StoreRouteMeta<TEntityMap> = CollectionRouteMeta<TEntityMap> & {
  action: keyof DbCollection<TEntityMap>
}

export type StoreRoute<TEntityMap> = Route<StoreRouteMeta<TEntityMap>> & {
  meta: StoreRouteMeta<TEntityMap>
  access?: RouteAccess
}

export type SchemaRoute<TEntityMap> = Route<CollectionRouteMeta<TEntityMap>> & {
  meta: CollectionRouteMeta<TEntityMap>
}

export type Method = keyof Application & ('get' | 'post')

export interface GetPath {
  (collectionSlug: string, actionSlug: string, omitId?: boolean): string
}

export interface GetResult<TEntityMap, TResult = any> {
  (
    collectionKey: keyof TEntityMap,
    store: EntitySchemaDb<TEntityMap>,
    action: keyof DbCollection<TEntityMap>,
    req: Request,
    omitId?: boolean
  ): Promise<TResult>
}

export type ActionType = NullablePerms
