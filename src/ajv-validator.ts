import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { clone, objectFilter } from '@mojule/util'
import traverse = require( '@entity-schema/json-schema-traverse' )

import { 
  EntitySchemaMap, IdSchema, refFactory, SchemaMap, ValidateEntity 
} from '@mojule/entity-app'

import { log } from '@mojule/log-iisnode'

const createRef = refFactory( '#' )

export const ajvValidator = <TEntityMap>(
  entitySchemas: EntitySchemaMap<TEntityMap>,
  commonSchemas: SchemaMap = {}
) => {
  // clone so we don't alter original schema when we pre-process them for 
  // ajv (see below)
  entitySchemas = clone( entitySchemas )
  commonSchemas = clone( commonSchemas )

  const ajv = new Ajv()

  addFormats( ajv )

  ajv.addFormat( 'multiline', () => true )
  ajv.addFormat( 'password', s => typeof s === 'string' )  
  ajv.addVocabulary([ 
    'create', 'read', 'update', 'delete', '_esUnique', '_esParentKey', 
    '_esRoles'
  ])

  const keyToIdMap = new Map<string, string>()  

  const allSchema = Object.assign( {}, entitySchemas, commonSchemas )

  const addSchema = ( type: string, schema: IdSchema ) => {
    /*
      we inline our schema for json-schema-to-ts, but ajv considers having more
      than one subschema with the same $id to be incorrect usage, so we have
      to remove them first
      
      see:
      https://github.com/ajv-validator/ajv/issues/1413#issuecomment-864738837
    */
    traverse( schema, ( node, _ptr, root ) => {
      if( node === root ) return

      if( typeof node.$id === 'string' ){
        delete node.$id
      }
    })
    
    try {      
      ajv.addSchema( schema, schema.$id )
    } catch( err ){
      log.error( `Error while adding ${ type } schema ${ schema.$id }` )

      throw err
    }    
  }

  Object.keys( commonSchemas ).forEach( key => {
    const schema = commonSchemas[ key ]

    keyToIdMap.set( key, schema.$id )

    addSchema( 'common', schema )
  } )

  Object.keys( entitySchemas ).forEach( key => {
    const schema = entitySchemas[ key ]

    keyToIdMap.set( key, schema.$id )

    addSchema( 'entity', schema )
    
    const refSchema = createRef( key )

    addSchema( 'ref', refSchema )
  } )

  const validator: ValidateEntity<TEntityMap> = async ( key, entity ) => {
    // ignore any meta properties present
    entity = objectFilter( entity, k => !k.startsWith( '_' ) )

    const schemaId = keyToIdMap.get( key )!

    if ( !ajv.validate( schemaId, entity ) ) {
      let message = ajv.errorsText( ajv.errors )
      let entityJson = ''
      let schemaJson = ''

      try {
        const schema = allSchema[ key ]

        entityJson = JSON.stringify( entity, null, 2 )
        schemaJson = JSON.stringify( schema, null, 2 )

        message += `\nEntity:\n${ entityJson }\nSchema:\n${ schemaJson }`
      } catch( err ){
        message += '\nError stringifying entity or schema'
      }

      return Error( message )
    }

    return null
  }

  return validator
}
