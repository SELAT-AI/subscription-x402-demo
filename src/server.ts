import { config as loadDotenv } from "dotenv";
import { createApp } from "./app.js";
import { loadEnv } from "./config.js";

loadDotenv();

function bootstrap(): void {
  try {
    const env = loadEnv(process.env);
    const app = createApp({
      receiverWalletAddress: env.receiverWalletAddress,
      subscriptionPrice: env.subscriptionPrice,
    });

    app.listen(env.port, () => {
      console.log(`x402 subscription server listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to start server: ${message}`);
    process.exit(1);
  }
}

bootstrap();
