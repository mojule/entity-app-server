import { EntitySchemaMap, IdSchema, SchemaMap, ValidateEntity } from '@mojule/entity-app';
export declare const ajvValidator: <TEntityMap>(entitySchemas: import("@mojule/util").KeyValueMap<TEntityMap, IdSchema>, commonSchemas?: SchemaMap) => ValidateEntity<TEntityMap>;
