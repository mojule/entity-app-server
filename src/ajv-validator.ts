import Ajv from 'ajv'
import addFormats from 'ajv-formats'

import { objectFilter } from '@mojule/util'

import { 
  EntitySchemaMap, refFactory, SchemaMap, ValidateEntity 
} from '@mojule/entity-app'

const createRef = refFactory( '#' )

export const ajvValidator = <TEntityMap>(
  entitySchemas: EntitySchemaMap<TEntityMap>,
  commonSchemas: SchemaMap = {}
) => {
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

  Object.keys( commonSchemas ).forEach( key => {
    const schema = commonSchemas[ key ]

    keyToIdMap.set( key, schema.$id )

    ajv.addSchema( schema, schema.$id )
  } )

  Object.keys( entitySchemas ).forEach( key => {
    const schema = entitySchemas[ key ]
    const refSchema = createRef( key )

    keyToIdMap.set( key, schema.$id )

    ajv.addSchema( schema, schema.$id )
    
    if( ajv.schemas[ refSchema.$id ] === undefined ){
      ajv.addSchema( refSchema, refSchema.$id )
    } else {
      console.warn( `Already found ${ refSchema.$id } when setting up ajv` )
    }   
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
