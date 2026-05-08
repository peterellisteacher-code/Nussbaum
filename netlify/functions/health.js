// Netlify Function — health check used by the frontend to detect whether
// the Socratic backend is reachable.

export default async () => {
  return new Response(JSON.stringify({
    status: 'ok',
    apiKeySet: !!process.env.ANTHROPIC_API_KEY
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const config = {
  path: '/api/health'
};
