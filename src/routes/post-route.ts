import * as express from 'express'
import { RequestHandler } from 'express-serve-static-core'

import { kebabCase } from '@mojule/util'

import { errorHandler } from './error-handler'
import { defaultPostPath, defaultPostResult } from './store-routes'
import { StoreRoute, StoreRouteMeta, GetPath, GetResult } from './types'
import { DbCollection, EntitySchemaDb } from '@mojule/entity-app'

export const postStoreRoute = <TEntityMap>(
  collectionKey: keyof TEntityMap,
  store: EntitySchemaDb<TEntityMap>,
  action: keyof DbCollection<TEntityMap>,
  getPath: GetPath = defaultPostPath,
  getResult: GetResult<TEntityMap> = defaultPostResult,
) => {
  const method = 'post'
  const collectionSlug = kebabCase( String( collectionKey ) )
  const actionSlug = kebabCase( String( action ) )
  const path = getPath( collectionSlug, actionSlug )

  const handler: RequestHandler = async ( req, res ) => {
    try {
      const result = await getResult( collectionKey, store, action, req )

      res.json( result )
    } catch ( err ) {
      errorHandler( res, err )
    }
  }

  const handlers = [ express.json(), handler ]

  const meta: StoreRouteMeta<TEntityMap> = {
    collectionKey, action
  }

  const route: StoreRoute<TEntityMap> = {
    method, path, handlers, meta
  }

  return route
}
