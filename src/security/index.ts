import * as bcrypt from 'bcryptjs'
import { Request } from 'express-serve-static-core'
import { v4 } from 'uuid'

import { Logger } from '@mojule/log-formatter/src/types'

import { 
  ApiKeyEntity, DbItem, LoginUser, SecureDb, SecureEntityMap
} from '@mojule/entity-app'
import passport, { PassportStatic } from 'passport'

type Login = (user?: LoginUser) => Promise<SecureDb<SecureEntityMap>>

export const createSecurity = (login: Login, log: Logger) => {
  const userDbs = new Map<string,SecureDb<SecureEntityMap>>()

  const strategyPromise = async ( name: string, password: string ) => {
    try {
      const isNobody = name === 'nobody'

      const db = isNobody ? await login() : await login( { name, password } )

      userDbs.set( name, db )

      return { name, db }
    } catch( err ){
      return err as Error
    }
  }

  const strategy = (name = 'nobody', password = '', done) => {
    log.info( 'Password strategy' )

    strategyPromise( name, password ).then(
      errOrName => {
        if( typeof errOrName === 'string' ){
          return done( null, errOrName )
        }

        return done( errOrName )
      }
    )
  }

  const serializeUser = (userName: string, cb) => {
    cb(null, userName)
  }

  const deserializeUser = (
    _id: string,
    cb: (arg0: null | Error, arg1?: UserData) => void
  ) => {
    store.collections.user.load(_id)
      .then(user => {
        const { name, email, roles } = user

        user.roles.push(Roles.currentUser)

        cb(null, { _id, name, email, roles })
      })
      .catch(err => {
        cb(err)
      })
  }

  const apiKeyStrategy = (
    id: string, secret: string,
    done: (
      arg0: any,
      arg1?: boolean | (UserEntity & DbItem)
    ) => void
  ) => {
    log.info('API Key strategy', id )

    store.collections.apiKey.load(id)
      .then(async apiKey => {
        log.info(
          'API Key found'
        )

        const result = await bcrypt.compare(secret, apiKey.secret)

        if (!result) {
          log.warn('Key did not match')

          done(null, false)

          return
        }

        const { _id } = apiKey.user

        const user = await store.collections.user.load(_id)

        done(null, user)
      })
      .catch(err => {
        log.error(err)

        done(err)
      })
  }

  const createApiKey = async (user: UserEntity & DbItem, tags?: string[]) => {
    const uuid = v4()
    const secret = await bcrypt.hash(uuid, 10)

    const apiKey: ApiKeyEntity = {
      name: 'API Key for ' + user.name,
      user: {
        _id: user._id,
        _collection: 'user'
      },
      secret,
      tags
    }

    const id = await store.collections.apiKey.create(apiKey)
    const basicAuth = Buffer.from(`${id}:${uuid}`).toString('base64')

    return { basicAuth, id }
  }

  const getSessionApiKeyBasicAuth = async (req: Request): Promise<string> => {
    const { session } = <any>req

    if (session.apiKeyBasicAuth) return session.apiKeyBasicAuth

    const user = req['user'] as UserData | undefined

    if (!user) throw Error('No user!')

    if (!user._id) throw Error('No _id on user')

    const sessionApis = await store.collections.apiKey.find({
      'user._id': user._id,
      tags: 'session'
    })

    await Promise.all(
      sessionApis.map(
        sessionApi => store.collections.apiKey.remove(sessionApi._id)
      )
    )

    const userEntity = await store.collections.user.load(user._id)

    const apiKey = await createApiKey(userEntity, ['session'])

    session.apiKeyBasicAuth = apiKey.basicAuth

    return session.apiKeyBasicAuth
  }

  return {
    strategy, serializeUser, deserializeUser, apiKeyStrategy, createApiKey,
    getSessionApiKeyBasicAuth
  }
}
