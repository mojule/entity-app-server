import { posix } from 'path'
import { promises } from 'fs'
import * as mime from 'mime'

import { 
  DbCollection, DbRefFor, EntityDb, FileEntity, FileEntityMap, ImageFileEntity, 
  ZipFileEntity 
} from '@mojule/entity-app'

import { unzip, ensureParentDirectories, zip } from '@mojule/files'

import { 
  FileCreateData, FileCreateDependencies, CreateDiskFile, FileCreateOptions 
} from './types'

import { processImageFileData } from './process-image'

import { isImageMime } from './is-image-mime'
import { nextFilename } from './next-filename'

const { writeFile } = promises
const { parse, join } = posix

const noop = () => { }

type FileRef = DbRefFor<FileEntityMap,'file'>
type ImageFileRef = DbRefFor<FileEntityMap,'imageFile'>

export const FileCreateStorageFactory = (
  db: EntityDb<FileEntityMap>,
  diskFileDeps: FileCreateDependencies<FileEntity>,
  imageFileDeps: FileCreateDependencies<ImageFileEntity>,
  zipFileDeps: FileCreateDependencies<ZipFileEntity>,
  options: FileCreateOptions = {}
) => {
  const { 
    isExtractOnly = false, 
    overwriteExisting = false 
  } = options

  const diskFile = ( fileData: FileCreateData ) =>
    createDiskFile(
      db.collections.file,
      fileData,
      diskFileDeps.getStaticPath,
      diskFileDeps.getRootPath,
      diskFileDeps.validator || noop,
      overwriteExisting
    )

  const imageFile = ( fileData: FileCreateData ) =>
    createImageFile(
      db.collections.imageFile,
      fileData,
      imageFileDeps.getStaticPath,
      imageFileDeps.getRootPath,
      imageFileDeps.validator || noop,
      overwriteExisting
    )

  const zipFile = async ( fileData: FileCreateData ) => {
    const { mimetype, size, tags } = fileData    

    const {
      destFilePath, uriPath
    } = getPaths( 
      fileData, zipFileDeps.getStaticPath, zipFileDeps.getRootPath, 
      overwriteExisting 
    )

    let bufferMap: Record<string,Buffer>
    let buffer: Buffer

    if( fileData.bufferMap ){
      bufferMap = fileData.bufferMap
      buffer = await zip( bufferMap )
    } else if( fileData.buffer ){
      buffer = fileData.buffer
      bufferMap = await unzip( buffer )
    } else {
      throw Error( `Expected buffer or bufferMap` )
    }

    const originalPaths = Object.keys( bufferMap )
    const files: FileRef[] = []
    const images: ImageFileRef[] = []

    const paths = await Promise.all(
      originalPaths.map(
        async originalPath => {
          const { base, dir } = parse( originalPath )
          const mimetype = mime.getType( originalPath ) || 'application/octet-stream'
          const buffer = bufferMap[ originalPath ]

          const fileData: FileCreateData = {
            originalname: base,
            buffer: buffer,
            mimetype,
            size: buffer.byteLength,
            tags: []
          }

          const getRootPath = () =>
            join( zipFileDeps.getRootPath( fileData ), dir )

          if( isImageMime( mimetype ) ){
            const imageId = await createImageFile(
              db.collections.imageFile,
              fileData,
              imageFileDeps.getStaticPath,
              getRootPath,
              imageFileDeps.validator || noop,
              overwriteExisting
            )

            const ref: ImageFileRef = {
              _collection: 'imageFile',
              _id: imageId
            }

            images.push( ref )

            const imageEntity = await db.collections.imageFile.load( imageId )

            return imageEntity.meta.path
          }

          const fileId = await createDiskFile(
            db.collections.file,
            fileData,
            diskFileDeps.getStaticPath,
            getRootPath,
            diskFileDeps.validator || noop,
            overwriteExisting
          )

          const ref: FileRef = {
            _collection: 'file',
            _id: fileId
          }

          files.push( ref )

          const fileEntity = await db.collections.file.load( fileId )

          return fileEntity.meta.path
        }
      )
    )

    const zipFile: ZipFileEntity = {
      name: uriPath,
      meta: {
        path: uriPath,
        mimetype, size,
      },
      paths,
      files,
      images,
      isExtractOnly,
      tags
    }

    const id = await db.collections.zipFile.create( zipFile )

    await ensureParentDirectories( destFilePath )
    
    if( !isExtractOnly ){
      await writeFile( destFilePath, buffer )
    }

    return id
  }

  return { diskFile, imageFile, zipFile }
}

const createFileEntity = (
  fileData: FileCreateData,
  staticPath: ( fileData: FileCreateData ) => string,
  rootPath: ( fileData: FileCreateData ) => string,
  overwriteExisting: boolean
) => {
  const { mimetype, size, tags } = fileData
  const { uriPath } = getPaths( fileData, staticPath, rootPath, overwriteExisting )

  const diskFile: FileEntity = {
    name: uriPath,
    meta: {
      path: uriPath,
      mimetype, size
    },
    tags
  }

  return diskFile
}

const createDiskFile: CreateDiskFile<FileEntity> = async (
  collection: DbCollection<FileEntity>,
  fileData: FileCreateData,
  staticPath: ( fileData: FileCreateData ) => string,
  rootPath: ( fileData: FileCreateData ) => string,
  validator: ( entity: FileEntity, buffer: Buffer ) => void,
  overwriteExisting: boolean
) => {
  const { buffer } = fileData

  if( buffer === undefined  ) {
    throw Error( `Expected buffer` )
  }

  const { destFilePath } = getPaths( 
    fileData, staticPath, rootPath, overwriteExisting 
  )

  const diskFile = createFileEntity( 
    fileData, staticPath, rootPath, overwriteExisting 
  )

  validator( diskFile, buffer )

  const id = await collection.create( diskFile )

  await ensureParentDirectories( destFilePath )
  await writeFile( destFilePath, buffer )

  return id
}

const createImageFile: CreateDiskFile<ImageFileEntity> = async (
  collection: DbCollection<ImageFileEntity>,
  fileData: FileCreateData,
  staticPath: ( fileData: FileCreateData ) => string,
  rootPath: ( fileData: FileCreateData ) => string,
  validator: ( entity: ImageFileEntity, buffer: Buffer ) => void,
  overwriteExisting: boolean
) => {
  const { buffer } = fileData

  if( buffer === undefined  ) throw Error( `Expected buffer` )

  const { imageFile, image } = await processImageFileData( fileData )

  const { mimetype } = imageFile.meta

  const {
    destFilePath, uriPath
  } = getPaths( fileData, staticPath, rootPath, overwriteExisting )

  imageFile.meta.path = uriPath
  imageFile.name = uriPath

  validator( imageFile, buffer )

  await ensureParentDirectories( destFilePath )

  if ( image && mimetype !== 'image/jpeg' ) {
    image.write( destFilePath )
    
    // re-encoding may change size!
    const { length } = await image.getBufferAsync( mimetype )   
    imageFile.meta.size = length
  } else {
    await writeFile( destFilePath, buffer )
  }

  return collection.create( imageFile )
}

const getPaths = (
  fileData: FileCreateData,
  staticPath: ( fileData: FileCreateData ) => string,
  rootPath: ( fileData: FileCreateData ) => string,
  overwriteExisting: boolean
) => {
  const { originalname } = fileData

  const destPath = join( staticPath( fileData ), rootPath( fileData ) )
  
  const destName = (
    overwriteExisting ? 
    join( destPath, originalname ) : 
    nextFilename( destPath, originalname )
  )
  
  const destFilePath = join( destPath, destName )
  const uriPath = join( '/', rootPath( fileData ), destName )

  return { destPath, destName, destFilePath, uriPath }
}
