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

    if ( access.require ) {
      const r = hasRequestBit( access.require, 'r' ) ? 'r' : '-'
      const w = hasRequestBit( access.require, 'w' ) ? 'w' : '-'
      const x = hasRequestBit( access.require, 'x' ) ? 'x' : '-'

      allHandlers = [
        (req, _res, next) => {
          log.info(`${req.path} requires access`, [ r, w, x ].join(''))

          next()
        },
        passport.authenticate('basic', { session: false }),
        (req, _res, next) => {
          log.info(
            'Post basic authentication, isAuthenticated', req.isAuthenticated()
          )

          next()
        },
        createRouteAccessHandler( route.access, isUserInGroup ),
        ...handlers
      ]
    }

    app[method](path, ...allHandlers)
  })
}
