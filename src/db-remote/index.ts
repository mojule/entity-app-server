import {
  DbCollections, DbItem, EntityDb, EntityKeys
} from '@mojule/entity-app'

import { createCollection } from './create-collection'
import { DbRemoteReadOptions } from './types'

const initCollections = <TEntityMap, D extends DbItem>(
  keys: EntityKeys<TEntityMap>, options: DbRemoteReadOptions
) => {
  const collections: DbCollections<TEntityMap, D> = {} as any  

  for (const key in keys ) {
    const collection = createCollection<TEntityMap, keyof TEntityMap, D>(
      key, options
    )

    collections[key as keyof TEntityMap] = collection
  }

  return collections
}

export const creatRemoteStore = async <TEntityMap, D extends DbItem = DbItem>(
  _name: string, keys: EntityKeys<TEntityMap>, 
  options: DbRemoteReadOptions
) => {
  const drop = async () => { }

  const close = async () => { }

  const collections = initCollections<TEntityMap,D>(keys, options)

  const db: EntityDb<TEntityMap, D> = { drop, close, collections }

  return db
}
