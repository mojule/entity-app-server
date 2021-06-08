import { DbCollection, FileEntity, ZipFileEntity } from '@mojule/entity-app'

export interface DiskFileData {
  mimetype: string
  size: number
  tags: string[]
}

export interface ImageFileData extends DiskFileData {
  width: number
  height: number
}

export interface FileCreateData extends DiskFileData {
  originalname: string
  buffer?: Buffer
  bufferMap?: Record<string,Buffer>
}

export type GetFilePath = ( fileData: FileCreateData ) => string

export interface GetPaths {
  getStaticPath: GetFilePath
  getRootPath: GetFilePath
}

export interface FileCreateDependencies<T extends FileEntity> extends GetPaths {
  validator?: ( entity: T, buffer: Buffer ) => void
}

export type CreateDiskFile<T extends FileEntity> = (
  collection: DbCollection<T>,
  fileData: FileCreateData,
  staticPath: GetFilePath,
  rootPath: GetFilePath,
  validator: ( entity: T, buffer: Buffer ) => void
) => Promise<string>

export type CreateZipFile = (
  collection: DbCollection<ZipFileEntity>,
  fileData: FileCreateData,
  staticPath: GetFilePath,
  rootPath: GetFilePath,
  validator: ( entity: ZipFileEntity, buffer: Buffer ) => void,
  createDiskFile: ( fileData: FileCreateData ) => Promise<string>,
  createImageFile: ( fileData: FileCreateData ) => Promise<string>
) => Promise<string>
