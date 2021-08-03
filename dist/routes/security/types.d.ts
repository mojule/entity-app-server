import { RequestHandler } from 'express';
export declare type ForgotPasswordOptions = {
    changePasswordHandlers?: RequestHandler[];
    notifyUserPasswordReset: (userName: string, secret: string) => Promise<void>;
    notifyUserPasswordChange: (userName: string) => Promise<void>;
};
export declare type LoginOptions = {
    loginHandlers: RequestHandler[];
};
export declare type RegisterOptions = {
    registerHandlers?: RequestHandler[];
    notifyUserVerifyEmail: (userName: string, secret: string) => Promise<void>;
};
