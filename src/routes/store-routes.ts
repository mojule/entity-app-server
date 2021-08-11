import { Request } from 'express-serve-static-core'

import { 
  DbCollection, DbIds, DbItem, eachEntityKeySync, EntityDb, 
  EntityKeys, EntitySchemaDb, resolveRefsDeep, resolveRefsShallow 
} from '@mojule/entity-app'

import { KeyValueMap, eachKeyValueMap } from '@mojule/util'

import { postStoreRoute } from './post-route'
import { getStoreRoute } from './get-route'
import { Method, StoreRoute, GetPath, GetResult } from './types'

export const createStoreRoutes = <TEntityMap>(
  store: EntitySchemaDb<TEntityMap>,
  keys: EntityKeys<TEntityMap>,
  apiPrefix = '/api/v1/'
) => {
  const routes: StoreRoute<TEntityMap>[] = []

  eachEntityKeySync( keys, key => {
    const collectionRoutes = createCollectionRoutes( key, store )

    routes.push( ...collectionRoutes )
  } )

  routes.forEach( route => route.path = `${ apiPrefix }${ route.path }` )

  return routes
}

export const createCollectionRoutes = <TEntityMap>(
  collectionKey: keyof TEntityMap,
  store: EntitySchemaDb<TEntityMap>
) => {
  const storeRouteData: KeyValueMap<DbCollection<TEntityMap>, RouteConfig<TEntityMap>> = {
    ids: {
      method: 'get',
      omitId: true
    },
    create: {
      method: 'post'
    },
    createMany: {
      method: 'post'
    },
    load: {
      method: 'get'
    },
    loadMany: {
      method: 'post'
    },
    save: {
      method: 'post'
    },
    saveMany: {
      method: 'post'
    },
    remove: {
      method: 'get'
    },
    removeMany: {
      method: 'post'
    },
    find: {
      method: 'post'
    },
    findOne: {
      method: 'post'
    },
    loadPaged: {
      method: 'get',
      getPath: ( collectionSlug: string, actionSlug: string ) =>
        `${ collectionSlug }/${ actionSlug }/:pageSize/:pageIndex?`,
      getResult: async (
        collectionKey, store, action, req
      ) => {
        const collection = store.collections[ collectionKey ]
        const exec = collection[ action ]

        const pageSize = Number( req.params.pageSize )
        const pageIndex = (
          req.params.pageIndex ?
            Number( req.params.pageIndex ) : 0
        )

        const result = await exec( pageSize, pageIndex )

        return handleResolve( result, store, req )
      }
    }
  }

  const routes: StoreRoute<TEntityMap>[] = []
  
  eachKeyValueMap( storeRouteData, ( config, action ) => {
    if( config === undefined ) 
      throw Error( `The route config at ${ action } was undefined` )

    const { getPath, getResult } = config

    const route = (
      config.method === 'post' ?
        postStoreRoute(
          collectionKey, store, action, getPath, getResult
        ) :
        getStoreRoute(
          collectionKey, store, action, getPath, getResult,
          config.omitId
        )
    )

    routes.push( route )
  } )

  return routes
}

interface GetConfig<TEntityMap, TResult = any> {
  method: Method & 'get'
  omitId?: boolean
  getPath?: GetPath
  getResult?: GetResult<TEntityMap, TResult>
}

interface PostConfig<TEntityMap, TResult = any> {
  method: Method & 'post'
  getPath?: GetPath
  getResult?: GetResult<TEntityMap, TResult>
}

type RouteConfig<TEntityMap, TResult = any> = (
  GetConfig<TEntityMap, TResult> | PostConfig<TEntityMap, TResult>
)

export const defaultGetPath = (
  collectionSlug: string, actionSlug: string, omitId?: boolean
) =>
  `${ collectionSlug }/${ actionSlug }${ omitId ? '' : '/:id' }`

export const defaultGetResult = async <TEntityMap>(
  collectionKey: keyof TEntityMap,
  store: EntitySchemaDb<TEntityMap>,
  action: keyof DbCollection<TEntityMap>,
  req: Request,
  omitId?: boolean
) => {
  const collection = store.collections[ collectionKey ]
  const exec = collection[ action ]

  const result = (
    omitId ?
      await ( exec as DbIds )() :
      await exec( req.params.id )
  )

  return handleResolve( result, store, req )
}

export const defaultPostResult = async <TEntityMap>(
  collectionKey: keyof TEntityMap,
  store: EntitySchemaDb<TEntityMap>,
  action: keyof DbCollection<TEntityMap>,
  req: Request
) => {
  const arg = req.body
  const collection = store.collections[ collectionKey ]
  const result = await ( <any>collection[ action ] )( arg )

  return handleResolve( result, store, req )
}

export const defaultPostPath = (
  collectionSlug: string, actionSlug: string
) => `${ collectionSlug }/${ actionSlug }`

const isEntity = <TEntityMap>( value: any ):
  value is TEntityMap[ keyof TEntityMap ] & DbItem =>
    value && value[ '_id' ]

const isEntityArray = <TEntityMap>( value: any ):
  value is ( TEntityMap[ keyof TEntityMap ] & DbItem )[] =>
    Array.isArray( value ) && isEntity( value[ 0 ] )

const handleResolve = async <TEntityMap, TResult = any>(
  result: TResult, store: EntityDb<TEntityMap>, req: Request
) => {
  const { resolve } = req.query

  if( resolve === 'shallow' ){
    if( isEntityArray( result ) ){
      return Promise.all(
        result.map( e => resolveRefsShallow( store, e ) )
      )
    }

    if( isEntity( result ) ){
      return resolveRefsShallow( store, result )
    }
  }

  if ( resolve === 'deep' ) {
    if( isEntityArray( result ) ){
      return Promise.all(
        result.map( e => resolveRefsDeep( store, e ) )
      )
    }

    if( isEntity( result ) ){
      return resolveRefsDeep( store, result )
    }
  }

  return result
}
