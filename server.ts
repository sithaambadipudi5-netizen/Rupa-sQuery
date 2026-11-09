import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

// Entry point for Development and Google Cloud Run Production
async function bootstrap() {
  const isProduction = process.env.NODE_ENV === "production";
  const distBundle = path.join(process.cwd(), "dist", "server.cjs");

  // In production (Cloud Run, npm start), when compiled bundle exists:
  if (isProduction && fs.existsSync(distBundle)) {
    const bundleUrl = pathToFileURL(distBundle).href;
    await import(bundleUrl);
    return;
  }

  // In development (tsx) or when bundle is absent:
  await import("./server/app.ts");
}

bootstrap().catch((err) => {
  console.error("Fatal startup error in server.ts:", err);
  process.exit(1);
});
