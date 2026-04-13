export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // The destination backend on Railway
  const backendUrl = "https://hhhhhh-production-8b24.up.railway.app";

  // LOGGING (Visible in Cloudflare dashboard)
  console.log(`[PROXY-CATCHALL] Handling path: ${path}`);

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
