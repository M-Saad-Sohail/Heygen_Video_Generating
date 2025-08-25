import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  try {
    const { page = 1 } = req.query;

    const response = await fetch(`https://api.heygen.com/v2/avatars?page=${page}`, {
      headers: {
        "X-Api-Key": process.env.HEYGEN_API_KEY ?? "",
        Accept: "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || `API responded with ${response.status}`);
    }

    return res.status(200).json({ data });
  } catch (err: any) {
    console.error("Error fetching avatars:", err);
    return res.status(500).json({ error: { message: err?.message || "Failed to fetch avatars" } });
  }
}
