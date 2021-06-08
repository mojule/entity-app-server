import { PassportStatic } from 'passport';
import { Route } from '../types';
import { LoginOptions } from './types';
export declare const createSecurityLoginRoutes: (passport: PassportStatic, options?: LoginOptions) => Promise<{
    login: Route<any>;
    logout: Route<any>;
}>;
