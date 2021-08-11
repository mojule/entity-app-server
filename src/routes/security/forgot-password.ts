import * as express from 'express'
import { Request } from 'express-serve-static-core'

import { log } from '@mojule/log-iisnode'
import { delayPromise } from '@mojule/util'

import { Route } from '../types'
import { delayHandler } from '../../delay-handler'
import { ForgotPasswordOptions } from './types'

import {
  SecureDb, SecureEntityMap, testPassword
} from '@mojule/entity-app'

const postHandler = express.urlencoded({ extended: false })

export const createSecurityForgotRoutes =  async <EntityMap extends SecureEntityMap>(
    db: SecureDb<EntityMap>,
    options: ForgotPasswordOptions
  ) => {
    const {
      changePasswordHandlers = [],
      notifyUserPasswordChange, notifyUserPasswordReset
    } = options

    const forgotPassword: Route = {
      method: 'post',
      path: 'forgot-password',
      handlers: [
        postHandler,
        delayHandler,
        async (req, res) => {
          const start = Date.now()

          try {
            const { name } = req.body

            if (!name) throw Error('Expected name')

            const secret = await db.account.forgotPassword(name)

            await notifyUserPasswordReset(name, secret)
          } catch (err) {
            log.error(err)
          }

          const elapsed = Date.now() - start

          await delayPromise(250 - elapsed)

          res.redirect('/forgot-sent')
        }
      ]
    }

    const loginUser = (
      req: Request, user: { name: string }
    ) => new Promise<void>(
      (resolve, reject) => {
        req.login(user, err => {
          if (err) return reject(err)

          resolve()
        })
      }
    )

    const resetPassword: Route = {
      method: 'get',
      path: 'reset-password/:secret',
      handlers: [
        delayHandler,
        async (req, res) => {
          const start = Date.now()
          const { secret } = req.params

          try {
            if (!secret) throw Error('Expected secret')

            const userName = await db.account.userForSecret(
              secret, 'forgot-password'
            )

            await loginUser(req, { name: userName })
          } catch (err) {
            log.error(err)
          }

          const elapsed = Date.now() - start

          await delayPromise(250 - elapsed)

          res.redirect(`/change-password?secret=${secret}`)
        }
      ]
    }

    const changePassword: Route = {
      method: 'post',
      path: 'change-password',
      handlers: [
        postHandler,
        delayHandler,
        ...changePasswordHandlers,
        async (req, res) => {
          const start = Date.now()
          let { secret, password } = req.body

          try {
            if (!secret) throw Error('Expected secret')
            if (!password) throw Error('Expected password')

            const { isStrong } = testPassword(password)

            if (!isStrong) {
              throw Error('Expected strong password')
            }

            if (!req.isAuthenticated()) throw Error('Expected logged in user')

            await db.account.resetPassword(secret, password)

            const { user: reqUser } = req

            if (!reqUser) throw Error('Expected req.user')

            const name: string = reqUser['name']

            await notifyUserPasswordChange(name)
          } catch (err) {
            log.error(err)
          }

          const elapsed = Date.now() - start

          await delayPromise(250 - elapsed)

          res.redirect('/password-changed')
        }
      ]
    }

    return { forgotPassword, resetPassword, changePassword }
  }
