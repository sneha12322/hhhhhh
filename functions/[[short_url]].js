export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // 1. Static Asset Guard: If this is a JS, CSS, or image file, let Cloudflare serve it normally
  const staticExtensions = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|html|map)$/i;
  if (staticExtensions.test(path) || path.startsWith('/assets/') || path.startsWith('/public/')) {
    return context.next();
  }

  // 2. SPA Route Guard: Even if _routes.json fails, verify this isn't a known frontend route.
  // We use context.env.ASSETS.fetch("/") to serve index.html directly, bypassing any buggy 308 redirects.
  const spaPatterns = [/^\/dashboard(\/.*)?$/, /^\/login(\/.*)?$/, /^\/auth-callback(\/.*)?$/, /^\/links(\/.*)?$/, /^\/auth(\/.*)?$/, /^\/$/];
  if (spaPatterns.some(pattern => pattern.test(path))) {
    return context.env.ASSETS.fetch(new URL("/", url.origin));
  }


  // The destination backend on Railway
  const backendUrl = "https://hhhhhh-production-8b24.up.railway.app";

  // LOGGING (Visible in Cloudflare dashboard)
  console.log(`[PROXY-CATCHALL] Processing: ${path}`);

  // Create a new URL that points to the backend
  const targetUrl = new URL(url.pathname + url.search, backendUrl);

  try {
    // Generate new request to proxy it
    const proxyRequest = new Request(targetUrl.toString(), {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.body,
      redirect: "manual" // IMPORTANT: Pass redirects (302) back to the browser to handle
    });

    const response = await fetch(proxyRequest);

    // If the response is a redirect from Railway, return it as-is so the browser follows it
    return response;
  } catch (error) {
    console.error(`[PROXY-ERROR] ${path}:`, error.message);
    return new Response(JSON.stringify({ error: "Gateway error", details: error.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}
