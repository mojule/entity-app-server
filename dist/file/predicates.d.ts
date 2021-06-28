import { FileEntity } from '@mojule/entity-app';
export declare const isZipFileEntity: (entity: FileEntity) => entity is {
    [x: string]: unknown;
    tags?: string[] | undefined;
    isExtractOnly?: boolean | undefined;
    meta: {
        path: string;
        mimetype: string;
        size: number;
    };
    name: string;
    paths: string[];
    files: {
        [x: string]: unknown;
        _id: string;
        _collection: "file";
    }[];
    images: {
        [x: string]: unknown;
        _id: string;
        _collection: "imageFile";
    }[];
};
export declare const isZipFileEntityArray: (entities: FileEntity[]) => entities is {
    [x: string]: unknown;
    tags?: string[] | undefined;
    isExtractOnly?: boolean | undefined;
    meta: {
        path: string;
        mimetype: string;
        size: number;
    };
    name: string;
    paths: string[];
    files: {
        [x: string]: unknown;
        _id: string;
        _collection: "file";
    }[];
    images: {
        [x: string]: unknown;
        _id: string;
        _collection: "imageFile";
    }[];
}[];
