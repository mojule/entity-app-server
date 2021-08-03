import { CreateDbItem, DbCollection, DbItem } from '@mojule/entity-app';
export declare const createCollection: <TEntity, D extends DbItem>(path: string, createDbItem: CreateDbItem<D>, formatJson: boolean) => DbCollection<TEntity, D>;
