import * as bcrypt from 'bcryptjs'
import express from 'express'
import { Request } from 'express-serve-static-core'
import { v4 } from 'uuid'

import { log } from '@mojule/log-iisnode'
import { delayPromise } from '@mojule/util'

import { Route } from '../types'
import { delayHandler } from '../../delay-handler'
import { ForgotPasswordOptions } from './types'

import { 
  DbItem, EntityDb, SecurityEntityMap, testPassword, UserEntity, 
  ResetPasswordEntity
} from '@mojule/entity-app'

const postHandler = express.urlencoded( { extended: false } )

export const createSecurityForgotRoutes = async <EntityMap extends SecurityEntityMap>(
  db: EntityDb<EntityMap>,
  options: ForgotPasswordOptions
) => {
  const { 
    changePasswordHandlers = [], 
    notifyUserPasswordChange, notifyUserPasswordReset 
  } = options

  // routes - forgot - post email, reset - post new password
  const forgotPassword: Route = {
    method: 'post',
    path: 'forgot-password',
    roles: [],
    handlers: [
      postHandler,
      delayHandler,
      async ( req, res ) => {
        const start = Date.now()

        try {
          const { email } = req.body

          if( !email ) throw Error( 'Expected email' )

          const user = await db.collections.user.findOne({ email })

          if( !user ) throw Error( `No user found for ${ email }` )

          const secret = v4()

          const resetPassword: ResetPasswordEntity = {
            name: `Reset password for ${ user.name }`,
            secret,
            user: { _collection: 'user', _id: user._id }
          }

          await db.collections.resetPassword.create( resetPassword )

          await notifyUserPasswordReset( user, secret )         
        } catch( err ){
          log.error( err )
        }

        const elapsed = Date.now() - start

        await delayPromise( 250 - elapsed )

        res.redirect('/forgot-sent')
      }      
    ]
  }

  const loginUser = ( 
    req: Request, user: UserEntity & DbItem 
  ) => new Promise<void>(
    ( resolve, reject ) => {
      req.login( user, err => {
        if( err ) return reject( err )

        resolve()
      })
    }
  )

  const resetPassword: Route = {
    method: 'get',
    path: 'reset-password/:secret',
    roles: [],
    handlers: [
      delayHandler,
      async ( req, res ) => {
        const start = Date.now()
        const { secret } = req.params

        try {
          if( !secret ) throw Error( 'Expected secret' )

          const query = { secret }
          const reset = await db.collections.resetPassword.findOne( query )

          if( !reset ) throw Error( `Expected resetPassword for ${ secret }` )
          
          const { _id } = reset.user

          const user = await db.collections.user.load( _id )

          await loginUser( req, user )

          db.collections.resetPassword.remove( reset._id )
        } catch( err ){
          log.error( err )
        }

        const elapsed = Date.now() - start

        await delayPromise( 250 - elapsed )

        res.redirect('/change-password')
      }
    ]
  }

  const changePassword: Route = {
    method: 'post',
    path: 'change-password',
    roles: [],
    handlers: [
      postHandler,
      delayHandler,
      ...changePasswordHandlers,
      async ( req, res ) => {
        const start = Date.now()
        let { password } = req.body

        try {
          if( !password ) throw Error( 'Expected password' )

          const { isStrong } = testPassword( password )

          if( !isStrong ){
            throw Error( 'Expected strong password' )
          }

          if( !req.isAuthenticated() ) throw Error( 'Expected logged in user' )
          
          const { user: reqUser } = req

          if( !reqUser ) throw Error( 'Expected req.user' )

          const id = reqUser[ '_id' ]

          if( typeof id !== 'string' ) throw Error( 'Expected user._id' )

          const user = await db.collections.user.load( id )

          user.password = await bcrypt.hash( password, 10 )

          await db.collections.user.save( user )

          await notifyUserPasswordChange( user )                
        } catch( err ){
          log.error( err )
        }

        const elapsed = Date.now() - start

        await delayPromise( 250 - elapsed )

        res.redirect('/password-changed')
      }
    ]
  }
  
  return { forgotPassword, resetPassword, changePassword }
}
