// @vitest-environment jsdom

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  downloadHushhGoldPass,
  isAppleWalletSupported,
  requestGoogleWalletPass,
} from "../src/services/walletPass";

describe("wallet pass service", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits Apple Wallet downloads through the same-origin proxy form", async () => {
    const submitSpy = vi
      .spyOn(HTMLFormElement.prototype, "submit")
      .mockImplementation(() => undefined);

    await downloadHushhGoldPass({
      name: "Test User",
      email: "test@example.com",
      organisation: "Hushh",
      slug: "test-user",
      userId: "user-123",
      investmentAmount: 125000,
    });

    const form = document.querySelector("form");
    const payloadInput = form?.querySelector(
      'input[name="payload"]'
    ) as HTMLInputElement | null;

    expect(form?.getAttribute("action")).toBe("/api/wallet-pass");
    expect(form?.getAttribute("method")).toBe("POST");
    expect(payloadInput).not.toBeNull();
    expect(JSON.parse(payloadInput!.value)).toMatchObject({
      passType: "storeCard",
      description: "Hushh Gold Investor Pass",
      barcode: { message: "https://hushhtech.com/investor/test-user" },
    });
    expect(submitSpy).toHaveBeenCalledTimes(1);
  });

  it("uses the same-origin Google Wallet proxy route", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ saveUrl: "https://pay.google.com/gp/v/save/test" }),
      blob: async () => new Blob(),
    } as Response);

    vi.stubGlobal("fetch", fetchMock);

    const result = await requestGoogleWalletPass({
      name: "Test User",
      slug: "test-user",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/google-wallet-pass",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(result).toEqual({
      saveUrl: "https://pay.google.com/gp/v/save/test",
    });
  });

  it("accepts real Apple mobile devices and rejects desktop emulation", () => {
    expect(
      isAppleWalletSupported({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
        platform: "iPhone",
        maxTouchPoints: 5,
      })
    ).toBe(true);

    expect(
      isAppleWalletSupported({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36",
        platform: "MacIntel",
        maxTouchPoints: 0,
      })
    ).toBe(false);
  });
});
