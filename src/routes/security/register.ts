import * as express from 'express'
import { Request, Response } from 'express-serve-static-core'

import { v4 } from 'uuid'

import { 
  createUserEntity, EntityDb, PendingUserEntity, Role, SecurityEntityMap, 
  testPassword 
} from '@mojule/entity-app'

import { delayPromise } from '@mojule/util'
import { log } from '@mojule/log-iisnode'

import { RegisterOptions } from './types'
import { delayHandler } from '../../delay-handler'
import { Route } from '../types'

const postHandler = express.urlencoded( { extended: false } )

export const createSecurityRegisterRoutes = async <EntityMap extends SecurityEntityMap>( 
  db: EntityDb<EntityMap>,
  options: RegisterOptions
) => {
  const { 
    registerHandlers = [],
    notifyUserVerifyEmail
  } = options

  const register: Route = {
    method: 'post',
    path: 'register',
    handlers: [
      // check password strength again
      // generate a secret
      // create a pendingUser
      // send email
      postHandler,
      delayHandler,
      ...registerHandlers,
      async ( req: Request, res: Response ) => {
        const start = Date.now()

        try {
          if( req.isAuthenticated() ){
            throw Error( 'User already logged in while registering' )
          }

          const { name, email, password } = req.body

          const existingUser = await db.collections.user.find({ email })

          if( existingUser.length ){
            throw Error( `User with email ${ email } already exists`)
          }

          const roles: Role[] = []
          const secret = v4()

          const { isStrong } = testPassword( password )

          if( !isStrong ){
            throw Error( 'Expected strong password' )
          }

          const userEntity = await createUserEntity(
            { name, email, roles }, password 
          )        

          const pendingUser: PendingUserEntity = Object.assign(
            userEntity, { secret }
          )

          await db.collections.pendingUser.create( pendingUser )

          await notifyUserVerifyEmail( pendingUser )
        } catch( err ){
          log.error( err )         
        }

        const elapsed = Date.now() - start

        await delayPromise( 250 - elapsed )

        res.redirect( '/verify-sent' ) 
      }
    ],
    roles: []
  }

  return { register }
}
