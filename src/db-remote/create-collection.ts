import { 
  DbCollection, DbCreate, DbCreateMany, DbFind, DbFindOne, DbIds, DbLoad, 
  DbLoadMany, DbLoadPaged, DbRemove, DbRemoveMany, DbSave, DbSaveMany
} from '@mojule/entity-app'

import { kebabCase, objToError } from '@mojule/util'

import fetch, { Response, RequestInit } from 'node-fetch'
import { DbRemoteReadOptions } from './types'

const handleResponse = async ( res: Response ) => {
  const textResult = await res.text()

  // was OK but didn't return a body
  if( res.ok && textResult.trim() === '' ) return

  const result = JSON.parse( textResult )

  if ( res.ok ) return result

  const err = objToError( result )

  throw err
}

export const createCollection = <TEntityMap,K extends keyof TEntityMap>(
  key: K, options: DbRemoteReadOptions
) => {
  const { uri, auth } = options

  const apiGet = async <TEntityMap, K extends keyof TEntityMap>(
    key: K, action: keyof DbCollection<TEntityMap[K]>, ...args: any[]
  ) => {
    const path = getPath<TEntityMap,K>( key, action, args )
  
    const response = await fetch( path )
  
    return handleResponse( response )
  }
  
  const getPath = <TEntityMap, K extends keyof TEntityMap>(
    key: K, action: keyof DbCollection<TEntityMap[ K ]>,
    ...args: any[]
  ) => {
    const keySlug = kebabCase( String( key ) )
    const actionSlug = kebabCase( action )
  
    const argSlugs = args.map( arg => String( arg ) )
  
    const getPath = [ uri, keySlug, actionSlug, ...argSlugs ].join( '/' )
  
    return getPath
  }
  
  const apiPost = async <TEntityMap, K extends keyof TEntityMap>(
    key: K, action: keyof DbCollection<TEntityMap[ K ]>, arg: any, id?: string
  ) => {
    const json = JSON.stringify( arg )
  
    let path = `${ uri }/${ kebabCase( String( key ) ) }/${ kebabCase( action ) }`
  
    if ( id ) {
      path += `/${ id }`
    }
  
    const headers: RequestInit[ 'headers' ] = {
      'Content-Type': 'application/json'    
    }
  
    const options: RequestInit = {
      method: 'POST',
      headers,
      body: json
    }
  
    if( auth ){
      headers.Authorization = auth
    }
  
    const response = await fetch( path, options )
  
    return handleResponse( response )
  }

  const ids: DbIds = async () => apiGet<TEntityMap,K>( key, 'ids' )

  const create: DbCreate<TEntityMap[ K ]> = async entity =>
    apiPost<TEntityMap, K>( key, 'create', entity )

  const createMany: DbCreateMany<TEntityMap[ K ]> = async entities =>
    apiPost<TEntityMap, K>( key, 'createMany', entities )

  const load: DbLoad<TEntityMap[ K ]> = async id =>
    apiGet<TEntityMap,K>( key, 'load', id )

  const loadMany: DbLoadMany<TEntityMap[ K ]> = async ids =>
    apiPost<TEntityMap,K>( key, 'loadMany', ids )

  const save: DbSave<TEntityMap[ K ]> = async document =>
    apiPost<TEntityMap,K>( key, 'save', document )

  const saveMany: DbSaveMany<TEntityMap[ K ]> = async documents =>
    apiPost<TEntityMap,K>( key, 'saveMany', documents )

  const remove: DbRemove = async id => apiGet<TEntityMap,K>( key, 'remove', id )

  const removeMany: DbRemoveMany = async ids =>
    apiPost<TEntityMap,K>( key, 'removeMany', ids )

  const find: DbFind<TEntityMap[ K ]> = async criteria =>
    apiPost<TEntityMap, K>( key, 'find', criteria )

  const findOne: DbFindOne<TEntityMap[ K ]> = async criteria =>
    apiPost<TEntityMap, K>( key, 'findOne', criteria )

  const loadPaged: DbLoadPaged<TEntityMap[ K ]> = async (
    pageSize: number, pageIndex = 0
  ) =>
    apiGet<TEntityMap,K>( key, 'loadPaged', pageSize, pageIndex )

  const entityCollection: DbCollection<TEntityMap[ K ]> = {
    ids, create, createMany, load, loadMany, save, saveMany, remove, removeMany,
    find, findOne, loadPaged
  }

  return entityCollection
}
