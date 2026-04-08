const UPSTREAM_GOOGLE_WALLET_ENDPOINT =
  "https://hushh-wallet.vercel.app/api/passes/google/create";

const resolvePayload = (body) => {
  if (!body) return null;
  if (typeof body.payload === "string") {
    try {
      return JSON.parse(body.payload);
    } catch {
      return null;
    }
  }

  return body;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = resolvePayload(req.body);
  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ error: "Invalid wallet pass payload" });
  }

  try {
    const forward = await fetch(UPSTREAM_GOOGLE_WALLET_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!forward.ok) {
      const text = await forward.text();
      return res.status(forward.status).json({
        error: "Google Wallet pass generation failed",
        detail: text,
      });
    }

    const contentType = forward.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await forward.json();
      return res.status(200).json(data);
    }

    const buffer = Buffer.from(await forward.arrayBuffer());
    const contentDisposition =
      forward.headers.get("content-disposition") ||
      'attachment; filename="hushh-profile-google.pkpass"';

    res.setHeader("Content-Type", contentType || "application/octet-stream");
    res.setHeader("Content-Disposition", contentDisposition);
    res.status(200).send(buffer);
  } catch (error) {
    console.error("google-wallet-pass proxy error:", error);
    res.status(500).json({ error: "Proxy failed", detail: error?.message });
  }
}
