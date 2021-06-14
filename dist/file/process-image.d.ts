/// <reference types="node" />
import * as Jimp from 'jimp';
import { FileCreateData } from './types';
export declare const processImageFileData: (fileData: FileCreateData) => Promise<{
    imageFile: {
        [x: string]: unknown;
        tags?: string[] | undefined;
        meta: {
            path: string;
            mimetype: string;
            size: number;
            width: number;
            height: number;
        };
        name: string;
    };
    image: Jimp | undefined;
}>;
export declare const getImageDimensions: (mimetype: string, buffer: Buffer) => Promise<{
    width: number;
    height: number;
}>;
