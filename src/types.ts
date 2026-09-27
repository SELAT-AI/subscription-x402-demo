import type { Request } from "express";

export interface PaymentDecisionContext {
  request: Request;
}

export interface PaymentRecordContext {
  request: Request;
  // x402 settlement metadata may be exposed by middleware, proxy, or custom headers.
  // Keep this generic for now and map it in your production business layer.
  settlement: unknown;
}

export interface SubscriptionBusinessHooks {
  shouldChargeUser(context: PaymentDecisionContext): Promise<boolean>;
  recordPayment(context: PaymentRecordContext): Promise<void>;
}
