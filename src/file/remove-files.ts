import { promises } from 'fs'
import { join } from 'path'

import { FileEntity, ZipFileEntity } from '@mojule/entity-app'

const { unlink } = promises

export const removeFs = async ( 
  entity: FileEntity, 
  rootPath: string 
) => {
  const pathToExisting = join( rootPath, entity.meta.path )

  unlink( pathToExisting )
}

export const removeZipFs = async ( 
  entity: ZipFileEntity, 
  rootPath: string, 
  unlinkZipChildren: boolean
) => {
  if( !entity.isExtractOnly ){    
    await removeFs( entity, rootPath )
  }

  if( unlinkZipChildren ){
    const allPaths = entity.paths.map( p => join( rootPath, p ) )

    await Promise.all( allPaths.map( unlink ) ) 
  }
}
