import { Request } from 'express-serve-static-core'

import { 
  ActionType, DbCollection, DbIds, DbItem, eachEntityKeySync, EntityDb, 
  EntityKeys, EntitySchemaDb, resolveRefsDeep, resolveRefsShallow 
} from '@mojule/entity-app'

import { KeyValueMap, eachKeyValueMap } from '@mojule/util'

import { postRoute } from './post-route'
import { getRoute } from './get-route'
import { Method, StoreRoute, GetPath, GetResult } from './types'

export const createStoreRoutes = <TEntityMap>(
  store: EntitySchemaDb<TEntityMap>,
  keys: EntityKeys<TEntityMap>,
  apiPrefix = '/api/v1/',
  readOnly = false
) => {
  const routes: StoreRoute<TEntityMap>[] = []

  eachEntityKeySync( keys, key => {
    const collectionRoutes = createCollectionRoutes( key, store, readOnly )

    routes.push( ...collectionRoutes )
  } )

  routes.forEach( route => route.path = `${ apiPrefix }${ route.path }` )

  return routes
}

export const createCollectionRoutes = <TEntityMap>(
  collectionKey: keyof TEntityMap,
  store: EntitySchemaDb<TEntityMap>,
  readOnly: boolean
) => {
  const storeRouteData: KeyValueMap<DbCollection<TEntityMap>, RouteConfig<TEntityMap>> = {
    ids: {
      method: 'get',
      omitId: true,
      type: 'read'
    },
    create: {
      method: 'post',
      type: 'create'
    },
    createMany: {
      method: 'post',
      type: 'create'
    },
    load: {
      method: 'get',
      type: 'read'
    },
    loadMany: {
      method: 'post',
      type: 'read'
    },
    save: {
      method: 'post',
      type: 'update'
    },
    saveMany: {
      method: 'post',
      type: 'update'
    },
    remove: {
      method: 'get',
      type: 'delete'
    },
    removeMany: {
      method: 'post',
      type: 'delete'
    },
    find: {
      method: 'post',
      type: 'read'
    },
    findOne: {
      method: 'post',
      type: 'read'
    },
    loadPaged: {
      method: 'get',
      getPath: ( collectionSlug: string, actionSlug: string ) =>
        `${ collectionSlug }/${ actionSlug }/:pageSize/:pageIndex?`,
      getResult: async (
        collectionKey, store, action, type, req
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
      },
      type: 'read'
    }
  }

  const routes: StoreRoute<TEntityMap>[] = []

  eachKeyValueMap( storeRouteData, ( config, action ) => {
    if( config === undefined ) 
      throw Error( `The route config at ${ action } was undefined` )

    const { getPath, getResult, type } = config

    if( readOnly && type !== 'read' ) return

    const route = (
      config.method === 'post' ?
        postRoute(
          collectionKey, store, action, type, getPath, getResult
        ) :
        getRoute(
          collectionKey, store, action, type, getPath, getResult,
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
  type: ActionType
}

interface PostConfig<TEntityMap, TResult = any> {
  method: Method & 'post',
  getPath?: GetPath
  getResult?: GetResult<TEntityMap, TResult>,
  type: ActionType
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
  type: ActionType,
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
  type: ActionType,
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
