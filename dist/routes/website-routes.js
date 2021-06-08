"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebsiteRoute = void 0;
const DomComponents = require("@mojule/dom-components");
const files_1 = require("@mojule/files");
const util_1 = require("@mojule/util");
const path_1 = require("path");
const fs_1 = require("fs");
const log_iisnode_1 = require("@mojule/log-iisnode");
const dom_1 = require("../dom");
const serialize_1 = require("../dom/serialize");
const { join } = path_1.posix;
const { readFile, writeFile } = fs_1.promises;
const createWebsiteRoute = async (templates, staticPath, cachePath, resolveModels, resolvePostDom, disableCache = false) => {
    const getCacheName = (path) => join(cachePath, util_1.kebabCase(path) + '.html');
    const handler = async (req, res, next) => {
        try {
            log_iisnode_1.log.time('Website Route');
            if (!disableCache) {
                const cacheName = getCacheName(req.path);
                /*
                  resolve from the cache immediately, but an include, a static file,
                  the db etc may have changed, so after that, regenerate the cache
          
                  this means that the first time you get something from cache it may
                  be outdated, but subsequent requests will be up to date
                */
                //
                if (await files_1.exists(cacheName)) {
                    const html = await readFile(cacheName, 'utf8');
                    res.send(html);
                    log_iisnode_1.log.info('Sending from cache');
                    log_iisnode_1.log.time('Website Route');
                    // regenerate cache
                    generateHtml(req, res);
                    return;
                }
            }
            const html = await generateHtml(req, res);
            if (html) {
                res.send(html);
            }
            else {
                next();
            }
        }
        catch (err) {
            log_iisnode_1.log.error(err);
            // if env debug you should set showStack: true on the model
            const dom = templates.ErrorPage({ error: err });
            const html = serialize_1.serializeHtml(dom);
            res.send(html);
        }
    };
    const generateHtml = async (req, res) => {
        const start = process.hrtime();
        const toDom = DomComponents(document, templates);
        const requestedPath = join(staticPath, '.' + req.path);
        let indexPath = join(requestedPath, 'index.html');
        let currentRoute = '';
        if (!await files_1.exists(indexPath)) {
            const staticDirs = await files_1.readdirDeep(staticPath);
            const route = staticDirs.find(s => req.path.startsWith('/' + s));
            if (route) {
                indexPath = join(staticPath, route, 'index.html');
                currentRoute = req.path.substr(route.length + 2);
            }
        }
        if (await files_1.exists(indexPath)) {
            const componentHtml = await readFile(indexPath, 'utf8');
            const componentDom = dom_1.parseFragment(componentHtml);
            const routedEl = componentDom.querySelector('[route]');
            if (routedEl) {
                routedEl.setAttribute('route', currentRoute);
            }
            const resolvedComponentDom = await resolveModels(componentDom, req, res);
            let dom = toDom(resolvedComponentDom);
            dom = await resolvePostDom(dom, req, res);
            const html = serialize_1.serializeHtml(dom);
            if (!disableCache) {
                const cacheName = getCacheName(req.path);
                await writeFile(cacheName, html, 'utf8');
                const end = process.hrtime(start);
                const ms = end[0] * 1e3 + end[1] / 1e6;
                log_iisnode_1.log.debug(`generated html for ${req.path} and saved to cache in ${ms}ms`);
            }
            return html;
        }
    };
    const route = {
        method: 'get',
        path: '*',
        handlers: [handler],
        // TODO how to override for EG /admin
        roles: []
    };
    return route;
};
exports.createWebsiteRoute = createWebsiteRoute;
//# sourceMappingURL=website-routes.js.map