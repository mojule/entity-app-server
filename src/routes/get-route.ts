import { RequestHandler } from 'express-serve-static-core'

import { ActionType, DbCollection, EntitySchemaDb } from '@mojule/entity-app'

import { kebabCase } from '@mojule/util'

import { errorHandler } from './error-handler'
import { defaultGetPath, defaultGetResult } from './store-routes'
import { StoreRouteMeta, StoreRoute, GetPath, GetResult } from './types'
import { createEntitySchemaRouteHandler } from './schema-routes'

export const getRoute = <TEntityMap>(
  collectionKey: keyof TEntityMap,
  store: EntitySchemaDb<TEntityMap>,
  action: keyof DbCollection<TEntityMap>,
  type: ActionType,
  getPath: GetPath = defaultGetPath,
  getResult: GetResult<TEntityMap> = defaultGetResult,
  omitId = false
) => {
  const method = 'get'
  const collectionSlug = kebabCase(String(collectionKey))
  const actionSlug = kebabCase(String(action))
  const path = getPath(collectionSlug, actionSlug, omitId)

  const schemaHandler = createEntitySchemaRouteHandler(
    store, collectionKey, type
  )

  const handler: RequestHandler = async (req, res) => {
    try {
      const result = await getResult(
        collectionKey, store, action, type, req, omitId
      )

      res.json(result)
    } catch (err) {
      errorHandler(res, err)
    }
  }

  const handlers = [schemaHandler, handler]

  const meta: StoreRouteMeta<TEntityMap> = {
    collectionKey, action
  }

  // TODO - GET should actually respect _esRoles.read in schema

  const route: StoreRoute<TEntityMap> = {
    method, path, handlers, meta, roles: []
  }

  return route
}


