import { AppError } from "./errors";

export function normalizeMongoError(err: any): AppError {
  // Duplicate key (E11000)
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const msg = field
      ? `یہ ${field} پہلے سے موجود ہے`
      : "ڈپلیکیٹ ریکارڈ موجود ہے";
    return new AppError(400, msg, { code: err.code, keyValue: err.keyValue });
  }
  // CastError for ObjectId or invalid types
  if (err?.name === "CastError") {
    return new AppError(400, "شناخت نمبر درست نہیں ہے", {
      kind: err.kind,
      path: err.path,
      value: err.value,
    });
  }
  // ValidationError
  if (err?.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map((e: any) => e.message);
    return new AppError(400, messages[0] || "ویلیڈیشن میں خرابی", { messages });
  }
  // MongoNetworkError / connection failures
  if (
    err?.name?.includes("MongoNetwork") ||
    err?.message?.includes("ECONNREFUSED")
  ) {
    return new AppError(500, "ڈیٹا بیس دستیاب نہیں ہے، بعد میں کوشش کریں", {
      name: err.name,
      message: err.message,
    });
  }
  return new AppError(500, "سرور میں خرابی پیش آئی ہے", {
    name: err?.name,
    message: err?.message,
  });
}
