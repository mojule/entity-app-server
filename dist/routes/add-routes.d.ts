import { Application } from 'express';
import { Route } from './types';
import { PassportStatic } from 'passport';
import { Logger } from '@mojule/log-formatter/src/types';
import { IsUserInGroup } from '@mojule/entity-app';
export declare const addRoutes: (app: Application, passport: PassportStatic, routes: Route[], isUserInGroup: IsUserInGroup, log: Logger) => void;
