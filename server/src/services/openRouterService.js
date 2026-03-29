const axios = require('axios');

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Fallback chain — tried in order until one succeeds
const FALLBACK_MODELS = [
  'google/gemma-3-4b-it:free',
  'openai/gpt-oss-20b:free',
  'qwen/qwen3-4b:free',
  'meta-llama/llama-3.2-3b-instruct:free',
];

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const getModels = () => {
  const envModel = process.env.OPENROUTER_MODEL;
  if (envModel) {
    return [envModel, ...FALLBACK_MODELS.filter((m) => m !== envModel)];
  }
  return FALLBACK_MODELS;
};

const buildContext = (chunks) =>
  chunks
    .map(
      (chunk, i) =>
        `[Source ${i + 1}] Page ${chunk.pageNumber}, Paragraph ${chunk.paragraphNumber}:\n"${chunk.text}"`
    )
    .join('\n\n');

const callModel = async (model, messages, apiKey) => {
  const response = await axios.post(
    `${OPENROUTER_BASE_URL}/chat/completions`,
    { model, messages, temperature: 0.3, max_tokens: 1024 },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Healthify AI Agent',
      },
      timeout: 60000,
    }
  );
  return response.data.choices[0].message.content;
};

const askQuestion = async (question, relevantChunks) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

  const context = buildContext(relevantChunks);
  const models = getModels();

  const systemPrompt = `You are a helpful document assistant. Answer the user's question based ONLY on the provided document context below.

Rules:
1. Always cite your sources at the end of your answer using format: **[Source: Page X, Paragraph Y]**
2. If multiple sources are used, list all of them.
3. If the context does not contain enough information to answer, say: "I couldn't find relevant information in the document for this question."
4. Be concise and accurate.
5. Never fabricate information not present in the context.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Document Context:\n${context}\n\nQuestion: ${question}\n\nPlease answer based on the context above and cite the source(s).`,
    },
  ];

  let lastError;

  for (const model of models) {
    // Each model gets up to 2 attempts (for 429 rate limits)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[OpenRouter] Trying model: ${model} (attempt ${attempt})`);
        const answer = await callModel(model, messages, apiKey);
        console.log(`[OpenRouter] Success with model: ${model}`);

        const sources = relevantChunks.map((chunk) => ({
          page: chunk.pageNumber,
          paragraph: chunk.paragraphNumber,
          excerpt: chunk.text.substring(0, 150) + (chunk.text.length > 150 ? '...' : ''),
          chunkId: chunk.chunkId,
        }));

        return { answer, sources, model };
      } catch (err) {
        const status = err.response?.status;
        const detail =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message;

        console.warn(`[OpenRouter] model=${model} attempt=${attempt} status=${status}: ${detail}`);
        lastError = `OpenRouter error (${status ?? 'network'}): ${detail}`;

        if (status === 401) throw new Error(lastError); // wrong API key — stop immediately
        if (status === 404) break;                       // model unavailable — try next model
        if (status === 429 && attempt === 1) {
          console.log('[OpenRouter] Rate limited, waiting 4s before retry...');
          await sleep(4000);                             // wait then retry same model once
          continue;
        }
        break; // any other error — move to next model
      }
    }
  }

  throw new Error(lastError || 'All models failed');
};

module.exports = { askQuestion };
