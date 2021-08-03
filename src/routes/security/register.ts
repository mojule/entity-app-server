import * as express from 'express'
import { Request, Response } from 'express-serve-static-core'

import { SecureDb, SecureEntityMap, testPassword } from '@mojule/entity-app'

import { delayPromise } from '@mojule/util'
import { log } from '@mojule/log-iisnode'

import { RegisterOptions } from './types'
import { delayHandler } from '../../delay-handler'
import { Route } from '../types'

const postHandler = express.urlencoded( { extended: false } )

export const createSecurityRegisterRoutes = async <EntityMap extends SecureEntityMap>(
  db: SecureDb<EntityMap>,
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

          const { name, password } = req.body

          const { isStrong } = testPassword( password )

          if( !isStrong ){
            throw Error( 'Expected strong password' )
          }

          const existingUsers = await db.userNames()

          if( existingUsers.includes( name ) ){
            throw Error( `User named ${ name } already exists`)
          }

          const secret = await db.account.createPendingUser( { name, password })

          await notifyUserVerifyEmail( name, secret )
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
