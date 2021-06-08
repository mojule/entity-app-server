import * as express from 'express'
import { RequestHandler } from 'express-serve-static-core'

import { kebabCase } from '@mojule/util'

import { errorHandler } from './error-handler'
import { defaultPostPath, defaultPostResult } from './store-routes'
import { StoreRoute, StoreRouteMeta, GetPath, GetResult } from './types'
import { createEntitySchemaRouteHandler } from './schema-routes'
import { ActionType, DbCollection, EntitySchemaDb } from '@mojule/entity-app'

export const postRoute = <TEntityMap>(
  collectionKey: keyof TEntityMap,
  store: EntitySchemaDb<TEntityMap>,
  action: keyof DbCollection<TEntityMap>,
  type: ActionType,
  getPath: GetPath = defaultPostPath,
  getResult: GetResult<TEntityMap> = defaultPostResult,
) => {
  const method = 'post'
  const collectionSlug = kebabCase( String( collectionKey ) )
  const actionSlug = kebabCase( String( action ) )
  const path = getPath( collectionSlug, actionSlug )

  const schemaHandler = createEntitySchemaRouteHandler(
    store, collectionKey, type
  )

  const handler: RequestHandler = async ( req, res ) => {
    try {
      const result = await getResult( collectionKey, store, action, type, req )

      res.json( result )
    } catch ( err ) {
      errorHandler( res, err )
    }
  }

  const handlers = [ schemaHandler, express.json(), handler ]

  const meta: StoreRouteMeta<TEntityMap> = {
    collectionKey, action
  }

  const route: StoreRoute<TEntityMap> = {
    method, path, handlers, meta, roles: [ 'admin' ]
  }

  return route
}
