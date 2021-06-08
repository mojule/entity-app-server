import { EntitySchemaMap, SchemaMap, ValidateEntity } from '@mojule/entity-app';
export declare const ajvValidator: <TEntityMap>(entitySchemas: import("@mojule/util").KeyValueMap<TEntityMap, import("@mojule/entity-app").IdSchema>, commonSchemas?: SchemaMap) => ValidateEntity<TEntityMap>;
