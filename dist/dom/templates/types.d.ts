export interface TemplateDependencies {
    includeResolver: IncludeResolver;
}
export declare type IncludeResolver = (id: string) => string;
