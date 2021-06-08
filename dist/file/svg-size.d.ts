export interface ImageDimensions {
    width: number;
    height: number;
}
export interface SvgParsedDimensions {
    width?: number;
    height?: number;
    viewbox?: ImageDimensions;
}
export interface SvgParsedViewbox extends SvgParsedDimensions {
    viewbox: ImageDimensions;
}
export declare const getSvgSize: (svg: string) => ImageDimensions;
