import { JSDOM } from 'jsdom'

export const createDom = ( html = '<!doctype html>' ) => new JSDOM( html )

export const parseFragment = JSDOM.fragment
