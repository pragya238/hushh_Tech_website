// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import theme from "../src/theme";

const useInvestorProfileLogicMock = vi.fn();

vi.mock("../src/pages/investor-profile/logic", () => ({
  useInvestorProfileLogic: () => useInvestorProfileLogicMock(),
}));

import InvestorProfilePage from "../src/pages/investor-profile/ui";

describe("InvestorProfile wallet UI", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    useInvestorProfileLogicMock.mockReturnValue({
      step: "complete",
      isProcessing: false,
      profile: null,
      error: null,
      userData: null,
      isApplePassLoading: false,
      isGooglePassLoading: false,
      appleWalletSupported: false,
      appleWalletSupportMessage:
        "Available on iPhone in Wallet-supported browsers.",
      profileUrl: "https://hushhtech.com/investor/test-user",
      handleFormSubmit: vi.fn(),
      handleProfileConfirm: vi.fn(),
      handleCopyURL: vi.fn(),
      handleShare: vi.fn(),
      handleAppleWalletDownload: vi.fn(),
      handleGoogleWalletDownload: vi.fn(),
    });
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    vi.clearAllMocks();
  });

  it("disables Apple Wallet and shows the unsupported-device note", async () => {
    await act(async () => {
      root.render(
        React.createElement(
          ChakraProvider,
          { theme },
          React.createElement(InvestorProfilePage)
        )
      );
    });

    const appleButton = container.querySelector(
      'button[aria-label="Add to Apple Wallet"]'
    ) as HTMLButtonElement | null;

    expect(appleButton).not.toBeNull();
    expect(appleButton?.disabled).toBe(true);
    expect(container.textContent).toContain(
      "Available on iPhone in Wallet-supported browsers."
    );
  });
});
