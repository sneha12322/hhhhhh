import app from "./api/index.js";
import { createServer as createViteServer } from 'vite';
import path from "path";
import fs from "fs";

(async () => {
  // Add Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: path.join(process.cwd(), 'frontend'),
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // We inject vite middlewares BEFORE the SPA catch-all, because the catch-all
    // is registered at the very end of api/index.ts. 
    // To do this cleanly, we'll just prepend the vite middleware to the express router stack.
    // However, it's safer to just use it generically because the Vite middleware 
    // intercepts what it needs to explicitly.
    app.use(vite.middlewares);
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`live.fyi full unified engine active on port ${PORT}`);
  });
})();
