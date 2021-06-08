import {
  Request, Response, RequestHandler
} from 'express-serve-static-core'

import * as DomComponents from '@mojule/dom-components'
import { readdirDeep, exists } from '@mojule/files'
import { kebabCase } from '@mojule/util'

import { posix } from 'path'
import { promises } from 'fs'
import { log } from '@mojule/log-iisnode'
import { parseFragment } from '../dom'
import { serializeHtml } from '../dom/serialize'
import { Route } from './types'

const { join } = posix
const { readFile, writeFile } = promises

export const createWebsiteRoute = async (
  templates: any,
  staticPath: string,
  cachePath: string,
  resolveModels: ( dom: Node, req: Request, res: Response ) => Promise<Node>,
  resolvePostDom: ( dom: Node, req: Request, res: Response ) => Promise<Node>,
  disableCache = false
) => {
  const getCacheName = ( path: string ) => join(
    cachePath,
    kebabCase( path ) + '.html'
  )

  const handler: RequestHandler = async ( req, res, next ) => {
    try {
      log.time( 'Website Route' )

      if( !disableCache ){
        const cacheName = getCacheName( req.path )

        /*
          resolve from the cache immediately, but an include, a static file,
          the db etc may have changed, so after that, regenerate the cache
  
          this means that the first time you get something from cache it may
          be outdated, but subsequent requests will be up to date
        */
        //
        if ( await exists( cacheName ) ) {
          const html = await readFile( cacheName, 'utf8' )
  
          res.send( html )
  
          log.info( 'Sending from cache' )
          log.time( 'Website Route' )
  
          // regenerate cache
          generateHtml( req, res )
  
          return
        } 
      }

      const html = await generateHtml( req, res )

      if ( html ) {
        res.send( html )
      } else {
        next()
      }
    } catch ( err ) {
      log.error( err )

      // if env debug you should set showStack: true on the model
      const dom = templates.ErrorPage( { error: err } )
      const html = serializeHtml( dom )

      res.send( html )
    }
  }

  const generateHtml = async ( req: Request, res: Response ): Promise<string | undefined> => {
    const start = process.hrtime()
    const toDom = DomComponents( document, templates )

    const requestedPath = join( staticPath, '.' + req.path )
    let indexPath = join( requestedPath, 'index.html' )
    let currentRoute = ''

    if ( !await exists( indexPath ) ) {
      const staticDirs = await readdirDeep( staticPath )
      const route = staticDirs.find( s => req.path.startsWith( '/' + s ) )
      if ( route ) {
        indexPath = join( staticPath, route, 'index.html' )
        currentRoute = req.path.substr( route.length + 2 )
      }
    }

    if ( await exists( indexPath ) ) {
      const componentHtml = await readFile( indexPath, 'utf8' )
      const componentDom = parseFragment( componentHtml )

      const routedEl = componentDom.querySelector( '[route]' )
      if ( routedEl ) {
        routedEl.setAttribute( 'route', currentRoute )
      }

      const resolvedComponentDom = await resolveModels( componentDom, req, res )

      let dom = toDom( resolvedComponentDom )

      dom = await resolvePostDom( dom, req, res )

      const html = serializeHtml( dom )

      if( !disableCache ){
        const cacheName = getCacheName( req.path )

        await writeFile( cacheName, html, 'utf8' )
  
        const end = process.hrtime( start )
        const ms = end[ 0 ] * 1e3 + end[ 1 ] / 1e6
        
        log.debug( 
          `generated html for ${ req.path } and saved to cache in ${ ms }ms` 
        ) 
      }

      return html
    }
  }

  const route: Route = {
    method: 'get',
    path: '*',
    handlers: [ handler ],
    // TODO how to override for EG /admin
    roles: []
  }

  return route
}
