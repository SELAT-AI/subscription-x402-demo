import express, {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { createCdpFacilitatorClient } from "@coinbase/cdp-sdk/x402";
import { demoBusinessHooks } from "./businessHooks.js";
import type { SubscriptionBusinessHooks } from "./types.js";

export interface CreateAppOptions {
  receiverWalletAddress: `0x${string}`;
  subscriptionPrice: string;
  businessHooks?: SubscriptionBusinessHooks;
  paymentMiddlewareOverride?: RequestHandler;
}

const SUBSCRIPTION_ENDPOINT = "/x402/subscription";
const SUPPORTED_NETWORKS = [
    "eip155:8453", // Base
] as const;

export function createApp(options: CreateAppOptions): express.Express {
  const app = express();
  const businessHooks = options.businessHooks ?? demoBusinessHooks;

  app.use(express.json());

  const paidRouteConfig = {
    [`GET ${SUBSCRIPTION_ENDPOINT}`]: {
      accepts: SUPPORTED_NETWORKS.map(network => ({
        scheme: "exact" as const,
        price: options.subscriptionPrice,
        network,
        payTo: options.receiverWalletAddress,
      })),
      description: "SELAT subscription via x402",
      mimeType: "application/json",
    },
  };

  const x402Middleware =
    options.paymentMiddlewareOverride ??
    paymentMiddleware(
      paidRouteConfig,
      new x402ResourceServer(createCdpFacilitatorClient()).register(
        "eip155:8453",
        new ExactEvmScheme(),
      ),
    );

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.get(
    SUBSCRIPTION_ENDPOINT,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const shouldCharge = await businessHooks.shouldChargeUser({
          request: req,
        });

        if (!shouldCharge) {
          res.status(200).json({
            success: true,
            paymentRequired: false,
            message: "No payment required for this user.",
          });
          return;
        }

        res.locals.chargeRequired = true;
        next();
      } catch (error) {
        next(error);
      }
    },
    x402Middleware,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (res.locals.chargeRequired) {
          // TODO: Map settlement details from your deployed x402 integration surface.
          // Depending on your setup, data may come from middleware context or headers.
          const settlement = req.headers["payment-response"] ?? null;

          await businessHooks.recordPayment({
            request: req,
            settlement,
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    },
    (_req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        paymentRequired: true,
        message: "Payment verified and subscription content granted.",
        data: {
          plan: "pro",
        },
      });
    },
  );

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = err instanceof Error ? err.message : "Unexpected server error";

    res.status(500).json({
      success: false,
      error: message,
    });
  });

  return app;
}
