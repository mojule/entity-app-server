import { createDom, parseFragment } from '.'

export const parseFirst = ( html: string ) => parseFragment( html ).firstChild

export const parseDocument = ( html: string ) => {
  const dom = createDom( html )

  return dom.window.document
}
