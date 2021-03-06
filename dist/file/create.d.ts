import { EntityDb, FileEntity, FileEntityMap, ImageFileEntity, ZipFileEntity } from '@mojule/entity-app';
import { FileCreateData, FileCreateDependencies, FileCreateOptions } from './types';
export declare const FileCreateStorageFactory: (db: EntityDb<FileEntityMap>, diskFileDeps: FileCreateDependencies<FileEntity>, imageFileDeps: FileCreateDependencies<ImageFileEntity>, zipFileDeps: FileCreateDependencies<ZipFileEntity>, options?: FileCreateOptions) => {
    diskFile: (fileData: FileCreateData) => Promise<string>;
    imageFile: (fileData: FileCreateData) => Promise<string>;
    zipFile: (fileData: FileCreateData) => Promise<string>;
};
