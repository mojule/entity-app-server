export interface TemplateDependencies {
  includeResolver: IncludeResolver
}

export type IncludeResolver = ( id: string ) => string
