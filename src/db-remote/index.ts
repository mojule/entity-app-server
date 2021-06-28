import { DbCollections, eachEntityKeySync, EntityDb, EntityKeys } from '@mojule/entity-app'
import { createCollection } from './create-collection'
import { DbRemoteReadOptions } from './types'

const initCollections = <TEntityMap>( 
  keys: EntityKeys<TEntityMap>, options: DbRemoteReadOptions
) => {
  const collections: Partial<DbCollections<TEntityMap>> = {}

  eachEntityKeySync( keys, key => {
    collections[ <keyof TEntityMap>key ] =
      createCollection<TEntityMap, keyof TEntityMap>( key, options )
  })

  return collections as DbCollections<TEntityMap>
}

export const creatRemoteStore = async <TEntityMap>(
  _name: string, keys: EntityKeys<TEntityMap>, options: DbRemoteReadOptions
) => {
  const drop = async () => { }

  const close = async () => { }

  const collections = initCollections( keys, options )

  const db: EntityDb<TEntityMap> = { drop, close, collections }

  return db
}
