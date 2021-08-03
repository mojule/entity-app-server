import {
  DbCollection, DbCreate, DbCreateMany, DbFind, DbFindOne, DbIds, DbItem, 
  DbLoad, DbLoadMany, DbLoadPaged, DbRemove, DbRemoveMany, DbSave, DbSaveMany
} from '@mojule/entity-app'

import { kebabCase, objToError } from '@mojule/util'

import fetch, { Response, RequestInit } from 'node-fetch'
import { DbRemoteReadOptions } from './types'

const handleResponse = async (res: Response) => {
  const textResult = await res.text()

  // was OK but didn't return a body
  if (res.ok && textResult.trim() === '') return

  const result = JSON.parse(textResult)

  if (res.ok) return result

  const err = objToError(result)

  throw err
}

export const createCollection = <TEntityMap, K extends keyof TEntityMap, D extends DbItem>(
  key: K, options: DbRemoteReadOptions
) => {
  type Entity = TEntityMap[K]

  const { uri, auth } = options

  const apiGet = async (
    key: K, action: keyof DbCollection<Entity>, ...args: any[]
  ) => {
    const path = getPath(key, action, args)

    const response = await fetch(path)

    return handleResponse(response)
  }

  const getPath = (
    key: K, action: keyof DbCollection<Entity>,
    ...args: any[]
  ) => {
    const keySlug = kebabCase(String(key))
    const actionSlug = kebabCase(action)

    const argSlugs = args.map(arg => String(arg))

    const getPath = [uri, keySlug, actionSlug, ...argSlugs].join('/')

    return getPath
  }

  const apiPost = async (
    key: K, action: keyof DbCollection<Entity>, arg: any, id?: string
  ) => {
    const json = JSON.stringify(arg)

    let path = `${uri}/${kebabCase(String(key))}/${kebabCase(action)}`

    if (id) {
      path += `/${id}`
    }

    const headers: RequestInit['headers'] = {
      'Content-Type': 'application/json'
    }

    const options: RequestInit = {
      method: 'POST',
      headers,
      body: json
    }

    if (auth) {
      headers.Authorization = auth
    }

    const response = await fetch(path, options)

    return handleResponse(response)
  }

  const ids: DbIds = async () => apiGet(key, 'ids')

  const create: DbCreate<Entity> = async entity =>
    apiPost(key, 'create', entity)

  const createMany: DbCreateMany<Entity> = async entities =>
    apiPost(key, 'createMany', entities)

  const load: DbLoad<Entity, D> = async id =>
    apiGet(key, 'load', id)

  const loadMany: DbLoadMany<Entity, D> = async ids =>
    apiPost(key, 'loadMany', ids)

  const save: DbSave<Entity> = async document =>
    apiPost(key, 'save', document)

  const saveMany: DbSaveMany<Entity> = async documents =>
    apiPost(key, 'saveMany', documents)

  const remove: DbRemove = async id => apiGet(key, 'remove', id)

  const removeMany: DbRemoveMany = async ids =>
    apiPost(key, 'removeMany', ids)

  const find: DbFind<Entity, D> = async criteria =>
    apiPost(key, 'find', criteria)

  const findOne: DbFindOne<Entity, D> = async criteria =>
    apiPost(key, 'findOne', criteria)

  const loadPaged: DbLoadPaged<Entity, D> = async (
    pageSize: number, pageIndex = 0
  ) =>
    apiGet(key, 'loadPaged', pageSize, pageIndex)

  const entityCollection: DbCollection<Entity,D> = {
    ids, create, createMany, load, loadMany, save, saveMany, remove, removeMany,
    find, findOne, loadPaged
  }

  return entityCollection
}
