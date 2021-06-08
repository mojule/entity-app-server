import { Application } from 'express'
import { Route } from './types'
import { createRolesHandler } from '../security/roles-handler'
import { PassportStatic } from 'passport'
import { Logger } from '@mojule/log-formatter/src/types'

export const addRoutes = (
  app: Application,
  passport: PassportStatic,
  routes: Route[],
  log: Logger
) => {
  routes.forEach(route => {
    const { method, path, handlers, roles } = route

    let allHandlers = handlers

    if (roles.length > 0) {
      allHandlers = [
        (req, _res, next) => {
          log.info(`${req.path} requires roles`, roles)

          next()
        },
        passport.authenticate('basic', { session: false }),
        (req, _res, next) => {
          log.info(
            'Post basic authentication, isAuthenticated', req.isAuthenticated()
          )

          next()
        },
        createRolesHandler(roles),
        ...handlers
      ]
    }

    app[method](path, ...allHandlers)
  })
}
