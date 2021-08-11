import { IsUserInGroup } from '@mojule/entity-app'
import { accessMasks, AccessOptions, canAccess, NullableKey, parseSymbolicNotation, PermKey, r, w, x } from '@mojule/mode'
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
      permissions: parseSymbolicNotation( access.permissions )
    }

    // is there a method for this already?
    const accessKeys = (
      access.require.split('').filter( s => s !== '-' ) as PermKey[]
    )

    const request = accessKeys.reduce(
      ( req, key ) => req | accessMasks[ key ], 0
    )
    
    if( canAccess( request, options ) ){
      return next()
    }

    next( Error( 'Eperm' ) )
  }

  return handler
}
