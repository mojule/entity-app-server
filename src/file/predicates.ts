import { FileEntity, ZipFileEntity } from '@mojule/entity-app'

export const isZipFileEntity = ( entity: FileEntity ): entity is ZipFileEntity => 
  Array.isArray( entity.paths )

export const isZipFileEntityArray = ( entities: FileEntity[] ): entities is ZipFileEntity[] => 
  entities.every( isZipFileEntity )
