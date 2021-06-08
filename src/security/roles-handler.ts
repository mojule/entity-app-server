import { hasAllRoles, Role } from '@mojule/entity-app'
import { Handler } from 'express'

export const createRolesHandler = ( requiredRoles: Role[] ) => {
  const handler: Handler = ( req, _res, next ) => {
    const user = req.user 

    let currentRoles: Role[] = []

    if( user && Array.isArray( user[ 'roles' ] ) ){
      currentRoles = user[ 'roles' ]
    }

    const isInRoles = hasAllRoles( requiredRoles, currentRoles )    

    if( !isInRoles ){
      const err = Error( 'User is not authorized to perform this action' )
      
      next( err )

      return 
    }

    next()
  }

  return handler
}
