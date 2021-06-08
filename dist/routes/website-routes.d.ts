import { Request, Response } from 'express-serve-static-core';
import { Route } from './types';
export declare const createWebsiteRoute: (templates: any, staticPath: string, cachePath: string, resolveModels: (dom: Node, req: Request, res: Response) => Promise<Node>, resolvePostDom: (dom: Node, req: Request, res: Response) => Promise<Node>, disableCache?: boolean) => Promise<Route<any>>;
