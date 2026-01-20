export class AppError extends Error {
  statusCode: number;
  expose: boolean;
  details?: any;

  constructor(
    statusCode: number,
    message: string,
    details?: any,
    expose = true,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.expose = expose;
    this.details = details;
    Error.captureStackTrace?.(this, AppError);
  }
}

export function isAppError(err: any): err is AppError {
  return err && typeof err === "object" && err.name === "AppError";
}

export type ApiResult<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
};
