import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  resp: NextApiResponse,
) {
  return resp.status(410).json({
    success: false,
    message: "This endpoint has been removed. Use /super-admin-unlock.",
  });
}
