import { Application } from 'express'
import { Route } from './types'
import { PassportStatic } from 'passport'
import { Logger } from '@mojule/log-formatter/src/types'
import { hasRequestBit } from '@mojule/mode'
import { IsUserInGroup } from '@mojule/entity-app'
import { createRouteAccessHandler } from './create-route-access'

export const addRoutes = (
  app: Application,
  passport: PassportStatic,
  routes: Route[],
  isUserInGroup: IsUserInGroup,
  log: Logger
) => {
  routes.forEach(route => {
    const { method, path, handlers, access } = route

    let allHandlers = handlers

    if ( access ) {
      allHandlers = [
        (req, _res, next) => {
          log.info(`${req.path} requires access ${ access.require }`)

          next()
        },
        passport.authenticate('basic', { session: false }),
        (req, _res, next) => {
          log.info(
            'Post basic authentication, isAuthenticated', req.isAuthenticated()
          )

          next()
        },
        createRouteAccessHandler( access, isUserInGroup ),
        ...handlers
      ]
    } else {
      log.info( `${ method } ${ path } has no access requirement` )
    }

    app[method](path, ...allHandlers)
  })
}
