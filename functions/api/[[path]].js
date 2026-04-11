export async function onRequest(context) {
  // context.request is the incoming Request object
  // context.env is your environment variables (like API_URL if configured)
  const url = new URL(context.request.url);
  
  // The destination backend on Railway
  const backendUrl = "https://hhhhhh-production-8b24.up.railway.app";
  
  // Create a new URL that points to the backend
  const targetUrl = new URL(url.pathname + url.search, backendUrl);
  
  try {
    // Generate new request to proxy it
    const proxyRequest = new Request(targetUrl.toString(), {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.body,
      redirect: "manual"
    });
    
    return await fetch(proxyRequest);
  } catch (error) {
    return new Response(JSON.stringify({ error: "Gateway error", details: error.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}
