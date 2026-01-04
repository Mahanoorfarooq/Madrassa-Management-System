import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    // Redirect to the frontend page
    res.redirect(307, `/admission-form/${id}`);
}
