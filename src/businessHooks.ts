import type {
  PaymentDecisionContext,
  PaymentRecordContext,
  SubscriptionBusinessHooks,
} from "./types.js";

/**
 * Demo business hooks.
 *
 * Replace this with your own data access / business service integration:
 * 1) Query user subscription status and payment history in shouldChargeUser.
 * 2) Persist verified payment records in recordPayment.
 */
export const demoBusinessHooks: SubscriptionBusinessHooks = {
  async shouldChargeUser(context: PaymentDecisionContext): Promise<boolean> {

    // TODO: replace with real subscription/payment lookup.
    // if ( This user has an active subscription ) {
    //  return false;
    //}

    return true;
  },

  async recordPayment(_context: PaymentRecordContext): Promise<void> {
    // TODO: persist payment record to your DB / event bus.
    // Keep empty in demo to isolate x402 flow from business persistence.
  },
};
