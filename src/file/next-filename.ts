import { parse, join } from 'path'
import { existsSync } from 'fs'

// makes sure that filenames are both consistent and unique
export const nextFilename = ( root: string, filename: string ) => {
  if( filename === '' ) throw Error( 'Expected a filename' )

  const { base } = parse( filename )
  const segs = base.split( '.' ).map( s => s.split( ' ' ).join( '-' ) )
  const name = segs.shift()
  const ext = segs.length > 0 ? [ '', ...segs ].join( '.' ) : ''

  let currentFilename = name + ext
  let currentFilePath = join( root, currentFilename )
  let index = 1

  while( existsSync( currentFilePath ) ){
    currentFilename = `${ name }-copy-${ index }${ ext }`
    currentFilePath = join( root, currentFilename )
    index++
  }

  return currentFilename
}
