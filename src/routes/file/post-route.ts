import { Handler } from 'express-serve-static-core'
import * as multer from 'multer'

import { log } from '@mojule/log-iisnode'

import { FileCreateData } from '../../file/types'

const storage = multer.memoryStorage()
const upload = multer( { storage: storage } )

// needs to handle update as well

export const createFileHandlers = (
  createDiskFile: ( fileData: FileCreateData ) => Promise<string>
) => {
  const createFileHandlers: Handler[] = [
    upload.single( 'file' ),

    async ( req, res ) => {
      try {
        const defaultTags: string[] = []
        const { tags = defaultTags } = req.body
        const file = req[ 'file' ] as any

        const fileWithoutBuffer = Object.assign(
          {},
          file,
          { buffer: undefined }
        )

        log.info( { file: fileWithoutBuffer, tags } )

        const fileData: FileCreateData = Object.assign( file, { tags } )

        const id = await createDiskFile( fileData )

        res.json( [ null, id ] )
      } catch ( err ) {
        log.error( err )

        res.json( [ err.message || 'Unknown error' ] )
      }
    }
  ]

  return createFileHandlers
}
