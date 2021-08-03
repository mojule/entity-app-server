import { Request, Response } from 'express-serve-static-core'

import { 
  SecureDb, SecureEntityMap
} from '@mojule/entity-app'

import { log } from '@mojule/log-iisnode'
import { delayPromise } from '@mojule/util'

import { delayHandler } from '../../delay-handler'
import { Route } from '../types'

export const createSecurityVerifyRoutes = async <EntityMap extends SecureEntityMap>(
  db: SecureDb<EntityMap>
) => {
  const verify: Route = {
    method: 'get',
    path: 'verify/:secret',
    roles: [],
    handlers: [
      delayHandler,
      async (req: Request, res: Response) => {
        const start = Date.now()
        const { secret } = req.params

        try {
          if( !secret ) throw Error( 'Expected secret' )

          await db.account.verifyPendingUser( secret )
        } catch (err) {
          log.error(err)
        }

        const elapsed = Date.now() - start

        await delayPromise( 250 - elapsed )

        res.redirect( '/verify-success' )         
      }
    ]
  }

  return { verify }
}
