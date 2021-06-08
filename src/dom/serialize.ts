import {
  isTextNode, isElementNode, isCommentNode, isDocument, isFragment, isDocType
} from './util'

const doctype = '<!doctype html>'

export const serializeHtml = ( node: Node ): string => {
  if ( isTextNode( node ) ) return node.nodeValue || ''

  if ( isElementNode( node ) ) return node.outerHTML

  if ( isCommentNode( node ) ) return `<!--${ node.nodeValue }-->`

  if ( isDocument( node ) ) return serializeChildren( node )

  if ( isFragment( node ) ) return serializeFragment( node )

  if ( isDocType( node ) ) return doctype

  throw Error( 'Unsupported node type' )
}

const serializeChildren = ( node: Node ) =>
  [ ...node.childNodes ].map( serializeHtml ).join( '' )

const serializeFragment = ( fragment: DocumentFragment ) => {
  const [ first, second, ...rest ] = fragment.children

  if(
    first && first.tagName === 'HEAD' && second && second.tagName === 'BODY' &&
    rest.length === 0
  ){
    const head = serializeHtml( first )
    const body = serializeHtml( second )
    const html = `<html>${ head }${ body }</html>`

    return `${ doctype }${ html }`
  }

  return serializeChildren( fragment )
}