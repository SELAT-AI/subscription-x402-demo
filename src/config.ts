export interface AppEnv {
  receiverWalletAddress: `0x${string}`;
  port: number;
  subscriptionPrice: string;
}

export function loadEnv(env: NodeJS.ProcessEnv): AppEnv {
  const receiverWalletAddress = env.RECEIVER_WALLET_ADDRESS as `0x${string}` | undefined;
  const port = Number(env.PORT ?? 4021);
  const subscriptionPriceInput = env.SUBSCRIPTION_PRICE ?? "0.10";

  if (!receiverWalletAddress) {
    throw new Error("RECEIVER_WALLET_ADDRESS is required");
  }

  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("PORT must be a positive number");
  }

  const subscriptionPrice = toX402Price(subscriptionPriceInput);

  return {
    receiverWalletAddress,
    port,
    subscriptionPrice,
  };
}

function toX402Price(input: string): string {
  const value = input.trim();

  if (!/^\d+(\.\d+)?$/.test(value)) {
    throw new Error("SUBSCRIPTION_PRICE must be a numeric value, for example 18.5");
  }

  if (Number(value) <= 0) {
    throw new Error("SUBSCRIPTION_PRICE must be greater than 0");
  }

  return `$${value}`;
}
