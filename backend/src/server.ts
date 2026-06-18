import 'dotenv/config';
import { createApp } from "./app.js";
import { connectDatabase } from "./database/connect.js";
import { ensureAdminFromEnv } from "./database/ensure-admin.js";
import { ensureDocumentIndexes } from "./database/ensure-indexes.js";

const port = Number(process.env.PORT ?? 5000);
const app = createApp();

async function bootstrap() {
  await connectDatabase();
  await ensureDocumentIndexes().catch((err) => console.error("ensureDocumentIndexes failed:", err));
  await ensureAdminFromEnv().catch((err) => console.error("ensureAdminFromEnv failed:", err));

  app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start API server", error);
  process.exit(1);
});
