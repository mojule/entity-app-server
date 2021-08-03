import { 
  CreateDbItem, DbCollections, DbItem, defaultDrop, EntityDb, EntityKeys 
} from '@mojule/entity-app'

import { kebabCase } from '@mojule/util'

import { createCollection } from './create-collection'
import { promises, MakeDirectoryOptions } from 'fs'
import { posix } from 'path'
import { FsOptions } from './types'

const { mkdir } = promises

const mkdirSafe = async ( path: string, options?: MakeDirectoryOptions ) => {
  try {
    await mkdir( path, options )
  } catch ( err ) {
    if ( err.code !== 'EEXIST' ) throw err
  }
}

const initCollections = async <TEntityMap, D extends DbItem>(
  path: string, keys: EntityKeys<TEntityMap>, createDbItem: CreateDbItem<D>,
  formatJson = false
) => {
  const collections: DbCollections<TEntityMap, D> = <any>{}

  for( const key in keys ){
    const collectionPath = posix.join( path, key )

    await mkdirSafe( collectionPath )

    collections[ key ] = createCollection( 
      collectionPath, createDbItem, formatJson 
    )
  }

  return collections
}

export const createFsDb = async <TEntityMap, D extends DbItem>(
  name: string, keys: EntityKeys<TEntityMap>,
  createDbItem: CreateDbItem<D>,
  { dataPath, formatJson }: FsOptions = { dataPath: './data/fs' }
) => {
  name = kebabCase( name )

  const path = posix.join( dataPath, name )

  await mkdirSafe( path )

  const drop = async () => defaultDrop( db )()
  const close = async () => { }

  const collections = await initCollections( 
    path, keys, createDbItem, formatJson 
  )

  const db: EntityDb<TEntityMap, D> = { drop, close, collections }

  return db
}
