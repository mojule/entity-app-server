import { EntityDb, FileEntityMap } from '@mojule/entity-app';
export declare const copyFiles: (db: EntityDb<FileEntityMap>, sourceDirectory: string, destDirectory: string) => Promise<void>;
export declare const copyFilesRemote: (db: EntityDb<FileEntityMap>, uri: string, destDirectory: string) => Promise<void>;
