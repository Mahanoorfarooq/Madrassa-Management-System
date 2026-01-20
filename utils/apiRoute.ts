import type { NextApiRequest, NextApiResponse } from "next";
import { AppError, ApiResult, isAppError } from "./errors";
import { normalizeMongoError } from "./mongoError";

export type Handler = (
  req: NextApiRequest,
  res: NextApiResponse<ApiResult>,
) => Promise<void> | void;

export function withApiHandler(
  allowed: ("GET" | "POST" | "PUT" | "DELETE")[],
  handler: Handler,
) {
  return async function (req: NextApiRequest, res: NextApiResponse<ApiResult>) {
    try {
      if (!allowed.includes(req.method as any)) {
        return res
          .status(405)
          .json({ success: false, message: "میٹھڈ کی اجازت نہیں ہے" });
      }
      await Promise.resolve(handler(req, res));
    } catch (err: any) {
      const appErr = isAppError(err) ? err : normalizeMongoError(err);
      const status = appErr.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: appErr.message || "سرور میں خرابی پیش آئی ہے",
        error:
          process.env.NODE_ENV !== "production"
            ? appErr.details || { name: err?.name, message: err?.message }
            : undefined,
      });
    }
  };
}

export function ok<T>(
  res: NextApiResponse<ApiResult<T>>,
  data: T,
  message = "کارروائی کامیاب رہی",
) {
  return res.status(200).json({ success: true, message, data });
}

export function badRequest(
  res: NextApiResponse<ApiResult>,
  message = "درخواست میں غلطی ہے",
  error?: any,
) {
  return res.status(400).json({ success: false, message, error });
}

export function notFound(
  res: NextApiResponse<ApiResult>,
  message = "ریکارڈ نہیں ملا",
) {
  return res.status(404).json({ success: false, message });
}

export function unauthorized(
  res: NextApiResponse<ApiResult>,
  message = "براہ کرم لاگ اِن کریں",
) {
  return res.status(401).json({ success: false, message });
}

export function forbidden(
  res: NextApiResponse<ApiResult>,
  message = "اس عمل کی اجازت نہیں",
) {
  return res.status(403).json({ success: false, message });
}
