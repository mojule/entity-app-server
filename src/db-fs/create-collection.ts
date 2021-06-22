import { promises } from 'fs'

import { 
  DbCollection, DbCreate, DbIds, DbLoad, DbRemove, DbSave, defaultCreateMany, 
  defaultFind, defaultFindOne, defaultLoadMany, defaultLoadPaged, 
  defaultRemoveMany, defaultSaveMany 
} from '@mojule/entity-app'

import { randId } from '@mojule/util'

const { readFile, writeFile, readdir, unlink, stat } = promises

export const createCollection = <TEntity>(
  path: string, formatJson: boolean
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
    const _id = randId()
    const dbEntity = Object.assign( { _id }, entity )
    const json = stringify( dbEntity )

    await writeFile( filePath( _id ), json, 'utf8' )

    return _id
  }

  const createMany = defaultCreateMany( create )

  const load: DbLoad<TEntity> = async id => {
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

  const entityCollection: DbCollection<TEntity> = {
    ids, create, createMany, load, loadMany, save, saveMany, remove, removeMany,
    find, findOne, loadPaged
  }

  return entityCollection
}
