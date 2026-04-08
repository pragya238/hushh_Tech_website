import { describe, expect, it, vi } from "vitest";

import walletPassHandler from "../api/wallet-pass.js";
import googleWalletPassHandler from "../api/google-wallet-pass.js";

const createResponse = () => {
  const headers = new Map<string, string>();
  let statusCode = 200;
  let body: unknown;

  return {
    headers,
    get statusCode() {
      return statusCode;
    },
    get body() {
      return body;
    },
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      body = payload;
      return this;
    },
    send(payload: unknown) {
      body = payload;
      return this;
    },
    setHeader(name: string, value: string) {
      headers.set(name, value);
    },
  };
};

describe("wallet proxy routes", () => {
  it("accepts Apple form payloads and preserves upstream pass headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({
        "content-type": "application/vnd.apple.pkpass",
        "content-disposition": 'attachment; filename="upstream.pkpass"',
        "x-pass-serial": "serial-123",
        "x-pass-type": "storeCard",
      }),
      arrayBuffer: async () => new TextEncoder().encode("pkpass").buffer,
    });

    vi.stubGlobal("fetch", fetchMock);

    const req = {
      method: "POST",
      body: { payload: JSON.stringify({ passType: "storeCard" }) },
    };
    const res = createResponse();

    await walletPassHandler(req, res);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://hushh-wallet.vercel.app/api/passes/universal/create",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ passType: "storeCard" }),
      })
    );
    expect(res.statusCode).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/vnd.apple.pkpass");
    expect(res.headers.get("Content-Disposition")).toBe(
      'attachment; filename="upstream.pkpass"'
    );
    expect(res.headers.get("X-Pass-Serial")).toBe("serial-123");
    expect(res.headers.get("X-Pass-Type")).toBe("storeCard");
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  it("returns Google Wallet save URLs from the same-origin proxy", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ saveUrl: "https://pay.google.com/gp/v/save/test" }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const req = {
      method: "POST",
      body: { passType: "storeCard" },
    };
    const res = createResponse();

    await googleWalletPassHandler(req, res);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://hushh-wallet.vercel.app/api/passes/google/create",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ passType: "storeCard" }),
      })
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      saveUrl: "https://pay.google.com/gp/v/save/test",
    });
  });

  it("passes through Google Wallet binary responses when no save URL is returned", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({
        "content-type": "application/octet-stream",
        "content-disposition": 'attachment; filename="google-pass.pkpass"',
      }),
      arrayBuffer: async () => new TextEncoder().encode("google-pass").buffer,
    });

    vi.stubGlobal("fetch", fetchMock);

    const req = {
      method: "POST",
      body: { passType: "storeCard" },
    };
    const res = createResponse();

    await googleWalletPassHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/octet-stream");
    expect(res.headers.get("Content-Disposition")).toBe(
      'attachment; filename="google-pass.pkpass"'
    );
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });
});
