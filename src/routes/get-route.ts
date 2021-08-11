import { RequestHandler } from 'express-serve-static-core'

import { 
  DbCollection, EntitySchemaDb
} from '@mojule/entity-app'

import { kebabCase } from '@mojule/util'

import { errorHandler } from './error-handler'
import { defaultGetPath, defaultGetResult } from './store-routes'
import { StoreRouteMeta, StoreRoute, GetPath, GetResult, ActionType } from './types'

export const getStoreRoute = <TEntityMap>(
  collectionKey: keyof TEntityMap,
  store: EntitySchemaDb<TEntityMap>,
  action: keyof DbCollection<TEntityMap>,
  getPath: GetPath = defaultGetPath,
  getResult: GetResult<TEntityMap> = defaultGetResult,
  omitId = false
) => {
  const method = 'get'
  const collectionSlug = kebabCase(String(collectionKey))
  const actionSlug = kebabCase(String(action))
  const path = getPath(collectionSlug, actionSlug, omitId)

  const handler: RequestHandler = async (req, res) => {
    try {
      const result = await getResult(
        collectionKey, store, action, req, omitId
      )

      res.json(result)
    } catch (err) {
      errorHandler(res, err)
    }
  }

  const handlers = [handler]

  const meta: StoreRouteMeta<TEntityMap> = {
    collectionKey, action
  }

  const route: StoreRoute<TEntityMap> = {
    method, path, handlers, meta
  }

  return route
}


