import { 
  EntityDb, FileEntity, FileEntityMap
} from '@mojule/entity-app'

import { join } from '@mojule/util'
import { promises } from 'fs'
import { ensureParentDirectories } from '@mojule/files'
import fetch, { Response } from 'node-fetch'

const { copyFile, writeFile } = promises

export const copyFiles = async ( 
  db: EntityDb<FileEntityMap>, 
  sourceDirectory: string, destDirectory: string 
) => {
  const copyEntityFile = async ( entity: FileEntity ) => {
    const { path } = entity.meta
    const sourcePath = join( sourceDirectory, path )
    const destPath = join( destDirectory, path )

    await ensureParentDirectories( destPath )
    await copyFile( sourcePath, destPath )
  }

  const fileIds = await db.collections.file.ids()
  const imageIds = await db.collections.imageFile.ids()
  const zipIds = await db.collections.zipFile.ids()
  const files = await db.collections.file.loadMany( fileIds )
  const images = await db.collections.imageFile.loadMany( imageIds )
  const zips = await db.collections.zipFile.loadMany( zipIds )

  const entities: FileEntity[] = [
    ...files,
    ...images,
    ...zips.filter( z => !z.isExtractOnly )
  ]

  await Promise.all( entities.map( copyEntityFile ) )  
}

export const copyFilesRemote = async (
  db: EntityDb<FileEntityMap>, 
  uri: string, destDirectory: string
) => {
  const copyEntityFile = async ( entity: FileEntity ) => {
    const { path } = entity.meta
    let sourceUri = uri

    if( sourceUri.endsWith( '/' ) ) sourceUri = sourceUri.slice( 0, -1 )

    sourceUri += path
    
    const destPath = join( destDirectory, path )

    await ensureParentDirectories( destPath )
    
    const response = await fetch( sourceUri )

    const buffer = await response.buffer()
    
    await writeFile( destPath, buffer )
  }

  const fileIds = await db.collections.file.ids()
  const imageIds = await db.collections.imageFile.ids()
  const zipIds = await db.collections.zipFile.ids()
  const files = await db.collections.file.loadMany( fileIds )
  const images = await db.collections.imageFile.loadMany( imageIds )
  const zips = await db.collections.zipFile.loadMany( zipIds )

  const entities: FileEntity[] = [
    ...files,
    ...images,
    ...zips.filter( z => !z.isExtractOnly )
  ]

  await Promise.all( entities.map( copyEntityFile ) )  
}