// Netlify Function — Socratic chat endpoint.
// Routes to /api/chat via the `path` config below (no netlify.toml redirect needed).
// Requires ANTHROPIC_API_KEY env var (set in Netlify Site settings → Environment variables).

import Anthropic from '@anthropic-ai/sdk';
import { NUSSBAUM_SYSTEM_PROMPT, LEVEL_CONTEXTS } from '../../lib/system-prompt.js';

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { message, level = 1, history = [] } = body;
  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: 'message is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set on server' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const levelContext = LEVEL_CONTEXTS[level] || LEVEL_CONTEXTS[1];
  const messages = [
    ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: `[${levelContext}]\n\nStudent says: ${message.trim()}` }
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = client.messages.stream({
          model: 'claude-haiku-4-5',
          max_tokens: 250,
          system: [{
            type: 'text',
            text: NUSSBAUM_SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' }
          }],
          messages
        });

        for await (const event of messageStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err.message || 'API error' })}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no'
    }
  });
};

export const config = {
  path: '/api/chat'
};
