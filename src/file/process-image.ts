import * as Jimp from 'jimp'

import { ImageFileEntity } from '@mojule/entity-app'

import { FileCreateData } from './types'
import { getSvgSize } from './svg-size'
import { rasterFormats, toPngFormats } from './consts'

export const processImageFileData = async ( fileData: FileCreateData ) => {
  const { originalname, mimetype, size, buffer, tags } = fileData

  if( buffer === undefined  ) {
    throw Error( `Expected buffer` )
  }

  let name = originalname
  let mime = mimetype
  let image: Jimp | undefined
  let width = -1
  let height = -1

  if ( rasterFormats.includes( mimetype ) ) {
    image = await Jimp.read( buffer )
    width = image.getWidth()
    height = image.getHeight()
  } else if ( mimetype === 'image/svg+xml' ) {
    const dimensions = getSvgSize( buffer.toString( 'utf8' ) )

    width = dimensions.width
    height = dimensions.height
  } else {
    throw Error( 'Expected an image' )
  }

  if ( toPngFormats.includes( mimetype ) ) {
    name += '.png'
    mime = 'image/png'
  }

  const imageFile: ImageFileEntity = {
    name,
    meta: {
      path: '',
      mimetype: mime,
      size, width, height
    },
    tags
  }

  return { imageFile, image }
}

export const getImageDimensions = async ( mimetype: string, buffer: Buffer ) => {
  if ( rasterFormats.includes( mimetype ) ) {
    const image = await Jimp.read( buffer )
    const width = image.getWidth()
    const height = image.getHeight()

    return { width, height }
  }

  if ( mimetype === 'image/svg+xml' ) {
    const dimensions = getSvgSize( buffer.toString( 'utf8' ) )

    const width = dimensions.width
    const height = dimensions.height

    return { width, height }
  }

  return { width: -1, height: -1 }
}