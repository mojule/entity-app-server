import { RequestHandler } from 'express'

export type ForgotPasswordOptions = {
  changePasswordHandlers?: RequestHandler[]
  notifyUserPasswordReset: ( userName: string, secret: string ) => Promise<void>
  notifyUserPasswordChange: ( userName: string ) => Promise<void>
}

export type LoginOptions = {
  loginHandlers: RequestHandler[]
}

export type RegisterOptions = {
  registerHandlers?: RequestHandler[]
  notifyUserVerifyEmail: ( userName: string, secret: string ) => Promise<void>
}
