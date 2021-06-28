import { EntityDb, FileEntityMap } from '@mojule/entity-app';
export declare const decorateDbFileRemove: (db: EntityDb<FileEntityMap>, rootPath: string, keys?: (keyof FileEntityMap)[], unlinkZipChildren?: boolean, log?: (...args: any[]) => void) => void;
