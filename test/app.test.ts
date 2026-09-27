import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import type { SubscriptionBusinessHooks } from "../src/types.js";

const BASE_OPTIONS = {
  receiverWalletAddress: "0x1111111111111111111111111111111111111111" as const,
  subscriptionPrice: "$0.10",
};

describe("x402 subscription endpoint", () => {
  it("returns 200 when business layer says payment is not required", async () => {
    const hooks: SubscriptionBusinessHooks = {
      shouldChargeUser: vi.fn().mockResolvedValue(false),
      recordPayment: vi.fn().mockResolvedValue(undefined),
    };

    const mockedPaymentMiddleware = vi.fn((_req, _res, next) => {
      next();
    });

    const app = createApp({
      ...BASE_OPTIONS,
      businessHooks: hooks,
      paymentMiddlewareOverride: mockedPaymentMiddleware,
    });
    const response = await request(app).get("/x402/subscription");

    expect(response.status).toBe(200);
    expect(response.body.paymentRequired).toBe(false);
    expect(hooks.recordPayment).not.toHaveBeenCalled();
  });

  it("returns 402 when business layer says payment is required", async () => {
    const hooks: SubscriptionBusinessHooks = {
      shouldChargeUser: vi.fn().mockResolvedValue(true),
      recordPayment: vi.fn().mockResolvedValue(undefined),
    };

    const mockedPaymentMiddleware = vi.fn((_req, res) => {
      const payload = Buffer.from(
        JSON.stringify({ error: "Payment required", accepts: [{ network: "eip155:84532" }] }),
      ).toString("base64");
      res.setHeader("PAYMENT-REQUIRED", payload);
      res.status(402).json({});
    });

    const app = createApp({
      ...BASE_OPTIONS,
      businessHooks: hooks,
      paymentMiddlewareOverride: mockedPaymentMiddleware,
    });
    const response = await request(app).get("/x402/subscription");

    expect(response.status).toBe(402);
    const paymentRequired = response.headers["payment-required"];
    expect(typeof paymentRequired).toBe("string");
    expect(hooks.recordPayment).not.toHaveBeenCalled();
  });
});
