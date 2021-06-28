import { FileEntity, ZipFileEntity } from '@mojule/entity-app';
export declare const removeFs: (entity: FileEntity, rootPath: string) => Promise<void>;
export declare const removeZipFs: (entity: ZipFileEntity, rootPath: string, unlinkZipChildren: boolean) => Promise<void>;
