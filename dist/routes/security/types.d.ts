import { RequestHandler } from 'express';
import { PendingUserEntity, UserEntity } from '@mojule/entity-app';
export declare type ForgotPasswordOptions = {
    changePasswordHandlers?: RequestHandler[];
    notifyUserPasswordReset: (user: UserEntity, secret: string) => Promise<void>;
    notifyUserPasswordChange: (user: UserEntity) => Promise<void>;
};
export declare type LoginOptions = {
    loginHandlers: RequestHandler[];
};
export declare type RegisterOptions = {
    registerHandlers?: RequestHandler[];
    notifyUserVerifyEmail: (pendingUser: PendingUserEntity) => Promise<void>;
};
