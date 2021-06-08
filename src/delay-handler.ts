import { RequestHandler } from 'express'
import { randInt } from '@mojule/util'

export const delayHandler: RequestHandler = ( _req, _res, next ) => {
  setTimeout( next, randInt( 250 ) )
}
