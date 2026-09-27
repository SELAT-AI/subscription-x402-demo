# subscription-x402-demo

This project adapts traditional subscription billing to the machine payment protocol (x402), enabling agents to call [selat-pay](https://github.com/SELAT-AI/selat-pay) for subscription fee payments.

## What this demo does

- Exposes a protected endpoint: `GET /x402/subscription`
- Calls business-layer hook `shouldChargeUser` before paywall check
- Returns `200` immediately when user should not be charged (avoid duplicate payment)
- Returns `402 Payment Required` via x402 middleware when user must pay
- Supports USDC payment requirements on:
  - Base (`eip155:8453`)
- After successful payment verification, calls business-layer hook `recordPayment`

## Business layer extension points

See [src/types.ts](src/types.ts) and [src/businessHooks.ts](src/businessHooks.ts):

- `shouldChargeUser(context)`:
  - Implement your own subscription/payment status lookup
- `recordPayment(context)`:
  - Persist settlement/payment record to DB, message bus, etc.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
copy .env.example .env
```

3. Update values in `.env`:

- `CDP_API_KEY_ID`: your CDP API key id
- `CDP_API_KEY_SECRET`: your CDP API key secret/private key
- `RECEIVER_WALLET_ADDRESS`: receiver wallet address
- `SUBSCRIPTION_PRICE`: payment amount (number only), e.g. `18.5`

Note: CDP_API_KEY_ID and CDP_API_KEY_SECRET should be created on the [Coinbase developer platform](https://portal.cdp.coinbase.com/).

4. Start server:

```bash
npm run dev
```

## Tests

Run:

```bash
npm test
```

Includes:

- no-charge branch => returns `200`
- charge branch => returns `402`

## Notes

- This demo intentionally leaves subscription state check and payment record persistence as business-layer hooks.
- For production usage, connect those hooks to your real user/subscription datastore.
- Facilitator integration refers to [CDP Facilitator documents](https://docs.cdp.coinbase.com/x402/seller/facilitator).
- Facilitator may incur fees; please refer to [CDP Facilitator documents](https://docs.cdp.coinbase.com/x402/seller/facilitator).
- Copyright (c) 2026 SELAT AI LABS, INC.
- Redistribution should retain the attribution in [NOTICE](NOTICE) as required by Apache 2.0 section 4(d).
