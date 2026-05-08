// Local development server (Express).
// For Netlify deployment, the same logic lives in netlify/functions/chat.js
// — both import the system prompt + level contexts from lib/system-prompt.js
// so they stay in sync.

import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import cors from 'cors';
import { NUSSBAUM_SYSTEM_PROMPT, LEVEL_CONTEXTS } from './lib/system-prompt.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Chat endpoint ──────────────────────────────────────────────────────────

app.post('/api/chat', async (req, res) => {
  const { message, level = 1, history = [] } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  const levelContext = LEVEL_CONTEXTS[level] || LEVEL_CONTEXTS[1];

  const messages = [
    ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
    {
      role: 'user',
      content: `[${levelContext}]\n\nStudent says: ${message.trim()}`
    }
  ];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  try {
    const stream = client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 250,
      system: [
        {
          type: 'text',
          text: NUSSBAUM_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (err) {
    console.error('API error:', err.message);
    res.write(`data: ${JSON.stringify({ error: 'Could not reach Anthropic API. Check your API key.' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', apiKeySet: !!process.env.ANTHROPIC_API_KEY }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🏛  Nussbaum Learning Site (local dev)`);
  console.log(`   http://localhost:${PORT}\n`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY not set — Socratic panel requires it.');
    console.warn('   Windows: set ANTHROPIC_API_KEY=sk-ant-...');
    console.warn('   Then restart: npm start\n');
  } else {
    console.log('✓  Anthropic API key detected — Socratic panel active.\n');
  }
});
