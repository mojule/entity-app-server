import { IsUserInGroup } from '@mojule/entity-app';
import { Handler } from 'express';
import { RouteAccess } from './types';
export declare const createRouteAccessHandler: (access: RouteAccess, isUserInGroup: IsUserInGroup) => Handler;
