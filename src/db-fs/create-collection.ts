import { promises } from 'fs'

import { 
  CreateDbItem, DbCollection, DbCreate, DbIds, DbItem, DbLoad, DbRemove, DbSave, 
  defaultCreateMany,  defaultFind, defaultFindOne, defaultLoadMany, 
  defaultLoadPaged, defaultRemoveMany, defaultSaveMany 
} from '@mojule/entity-app'

const { readFile, writeFile, readdir, unlink, stat } = promises

export const createCollection = <TEntity, D extends DbItem>(
  path: string, createDbItem: CreateDbItem<D>, formatJson: boolean
) => {
  const stringify = (
    formatJson ? 
    ( value: any ) => JSON.stringify( value, null, 2 ):
    ( value: any ) => JSON.stringify( value )
  )
    
  const filePath = ( id: string ) => `${ path }/${ id }.json`

  const ids: DbIds = async () => {
    const fileIds =
      ( await readdir( path ) )
        .filter( s => s.endsWith( '.json' ) )
        .map( s => s.replace( /\.json$/, '' ) )

    return fileIds
  }

  const create: DbCreate<TEntity> = async entity => {
    const dbItem = createDbItem()

    const dbEntity = Object.assign( entity, dbItem )
    const json = stringify( dbEntity )

    await writeFile( filePath( dbItem._id ), json, 'utf8' )

    return dbItem._id
  }

  const createMany = defaultCreateMany( create )

  const load: DbLoad<TEntity, D> = async id => {
    const json = await readFile( filePath( id ), 'utf8' )
    const dbEntity = JSON.parse( json )

    return dbEntity
  }

  const loadMany = defaultLoadMany( load )

  const save: DbSave<TEntity> = async document => {
    const { _id } = document

    if ( typeof _id !== 'string' )
      throw Error( 'Expected document to have _id:string' )

    // must exist
    await stat( filePath( _id ) )

    const json = stringify( document )

    await writeFile( filePath( _id ), json, 'utf8' )
  }

  const saveMany = defaultSaveMany( save )

  const remove: DbRemove = async id => {
    await unlink( filePath( id ) )
  }

  const removeMany = defaultRemoveMany( remove )

  const find = defaultFind( ids, loadMany )
  const findOne = defaultFindOne( ids, loadMany )

  const loadPaged = defaultLoadPaged( ids, loadMany )

  const entityCollection: DbCollection<TEntity, D> = {
    ids, create, createMany, load, loadMany, save, saveMany, remove, removeMany,
    find, findOne, loadPaged
  }

  return entityCollection
}
