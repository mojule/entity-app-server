const NodeType = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11
}

export const isElementNode = ( value: Node ): value is Element =>
  value.nodeType === NodeType.ELEMENT_NODE

export const isTextNode = ( value: Node ): value is Text =>
  value.nodeType === NodeType.TEXT_NODE

export const isCommentNode = ( value: Node ): value is Comment =>
  value.nodeType === NodeType.COMMENT_NODE

export const isDocument = ( value: Node ): value is Document =>
  value.nodeType === NodeType.DOCUMENT_NODE

export const isDocType = ( value: Node ): value is DocumentType =>
  value.nodeType === NodeType.DOCUMENT_TYPE_NODE

export const isFragment = ( value: Node ): value is DocumentFragment =>
  value.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE
