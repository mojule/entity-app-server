/// <reference types="node" />
import * as Jimp from 'jimp';
import { ImageFileEntity } from '@mojule/entity-app';
import { FileCreateData } from './types';
export declare const processImageFileData: (fileData: FileCreateData) => Promise<{
    imageFile: ImageFileEntity;
    image: Jimp | undefined;
}>;
export declare const getImageDimensions: (mimetype: string, buffer: Buffer) => Promise<{
    width: number;
    height: number;
}>;
