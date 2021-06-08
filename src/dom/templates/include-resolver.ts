import { readPathBufferMap } from '@mojule/files'
import { readFileSync } from 'fs'
import { join } from 'path'

export const loadIncludeResolver = async ( 
  includesPath: string, useBuffer = true 
) => {
  if( !useBuffer ){
    const includeResolver = ( id: string ) => {
      const includePath = join( includesPath, id )

      return readFileSync( includePath, 'utf8' )
    }

    return includeResolver
  }

  const bufferMap = await readPathBufferMap( includesPath )
  
  const includeResolver = ( id: string ) => {
    if( bufferMap[ id ] === undefined ){
      throw Error( `Expected an include named ${ id }` )
    }

    return bufferMap[ id ].toString( 'utf8' )
  }

  return includeResolver
}
