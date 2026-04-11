import express from "express";
import { createServer as createViteServer } from 'vite';
import path from "path";
import apiApp from "./api/index.js";

(async () => {
  const app = express();

  // Add Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: path.join(process.cwd(), 'frontend'),
      server: { middlewareMode: true },
      appType: "custom", // Disable Vite's built-in SPA catch-all
    });
    
    app.use(vite.middlewares);
  }

  // Mount the real API router
  app.use(apiApp);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`live.fyi full unified engine active on port ${PORT}`);
  });
})();
