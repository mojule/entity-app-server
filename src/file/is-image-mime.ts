import { exludeImageFormats } from './consts'

export const isImageMime = ( mimetype: string ) => {
  if( !mimetype.startsWith( 'image/' ) ) return false
  if( exludeImageFormats.includes( mimetype ) ) return false

  // should we only include supported types actually?
  return true
}