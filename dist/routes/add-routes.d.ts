import { Application } from 'express';
import { Route } from './types';
import { PassportStatic } from 'passport';
import { Logger } from '@mojule/log-formatter/src/types';
export declare const addRoutes: (app: Application, passport: PassportStatic, routes: Route[], log: Logger) => void;
