import { IsUserInGroup } from '@mojule/entity-app'
import { AccessOptions, canAccess } from '@mojule/mode'
import { Handler } from 'express'
import { RouteAccess } from './types'

export const createRouteAccessHandler = ( 
  access: RouteAccess, isUserInGroup: IsUserInGroup 
) => {
  const handler: Handler = async ( req, _res, next ) => {   
    const name = req.user ? req.user[ 'name' ] : 'nobody'

    const options: AccessOptions = {
      isDirectory: access.isDirectory,
      isRoot: await isUserInGroup( name, 'root' ),
      isOwner: name === access.owner,
      isGroup: await isUserInGroup( name, access.group ),
      permissions: access.permissions
    }
    
    if( canAccess( access.require, options ) ){
      return next()
    }

    next( Error( 'Eperm' ) )
  }

  return handler
}
