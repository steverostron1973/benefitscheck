const AnthropicSdk = require('@anthropic-ai/sdk');
const Anthropic = AnthropicSdk.Anthropic || AnthropicSdk.default || AnthropicSdk;
const { Redis } = require('@upstash/redis');

const SESSION_LIMIT = 5;
const IP_LIMIT = 20;
const GLOBAL_LIMIT = 500;
const TTL_SECONDS = 60 * 60 * 24;

const SYSTEM_PROMPT = `You are helping someone draft a starting-point answer for a UK PIP (Personal Independence Payment) form. You are not giving legal or medical advice — you are helping them describe their genuine daily difficulties more clearly and specifically, in their own voice.

Rules:
- Write in first person, as if the user is speaking.
- Base your draft ONLY on what the user actually told you — never invent symptoms, frequency, or severity they didn't mention.
- Follow the "weak vs strong" pattern used across this site: prefer concrete, specific detail (what happens, how often, what help is needed) over vague statements.
- Reference safety, repeatability, and time where relevant to what the user described, without naming PIP regulations directly.
- Keep the draft to 100-150 words.
- End with a one-sentence reminder that they should review, adjust, and add any further detail before submitting, since this is a starting point, not a finished answer.
- Never fabricate specific numbers, frequencies, or incidents the user didn't state — if they were vague, keep the draft appropriately general rather than inventing false specificity.`;

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getClientIp(event) {
  const headers = event.headers || {};
  return (
    headers['x-nf-client-connection-ip'] ||
    headers['X-NF-Client-Connection-Ip'] ||
    headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    headers['client-ip'] ||
    'unknown'
  );
}

async function incrementWithLimit(redis, key, limit) {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, TTL_SECONDS);
  }
  return count > limit;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Invalid request body' });
  }

  const activity = typeof payload.activity === 'string' ? payload.activity.trim() : '';
  const condition = typeof payload.condition === 'string' ? payload.condition.trim() : '';
  const description = typeof payload.description === 'string' ? payload.description.trim() : '';
  const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId.trim() : '';

  if (!activity || !condition || !description || !sessionId) {
    return jsonResponse(400, {
      error: 'Please provide an activity, condition, description, and sessionId.',
    });
  }

  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN ||
    !process.env.ANTHROPIC_API_KEY
  ) {
    return jsonResponse(500, {
      error: 'Something went wrong, please try again.',
    });
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const date = todayKey();
  const ip = getClientIp(event);

  try {
    const sessionExceeded = await incrementWithLimit(
      redis,
      `session:${sessionId}`,
      SESSION_LIMIT
    );
    if (sessionExceeded) {
      return jsonResponse(429, {
        error:
          "You've used this tool a few times already — that's usually enough to get started on your form. Come back tomorrow if you need more.",
      });
    }

    const ipExceeded = await incrementWithLimit(redis, `ip:${ip}:${date}`, IP_LIMIT);
    if (ipExceeded) {
      return jsonResponse(429, {
        error: 'Too many requests, try again tomorrow.',
      });
    }

    const globalExceeded = await incrementWithLimit(redis, `global:${date}`, GLOBAL_LIMIT);
    if (globalExceeded) {
      return jsonResponse(429, {
        error: 'This tool is very popular today — please try again tomorrow.',
      });
    }
  } catch {
    return jsonResponse(500, {
      error: 'Something went wrong, please try again.',
    });
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const userMessage = [
      `PIP activity: ${activity}`,
      `Condition / diagnosis: ${condition}`,
      `How this activity is difficult for me:`,
      description,
    ].join('\n\n');

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const draft = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    if (!draft) {
      return jsonResponse(500, {
        error: 'Something went wrong, please try again.',
      });
    }

    return jsonResponse(200, { draft });
  } catch {
    return jsonResponse(500, {
      error: 'Something went wrong, please try again.',
    });
  }
};
