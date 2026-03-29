const { GoogleGenerativeAI } = require('@google/generative-ai');

// Fallback chain with separate free-tier quotas
const MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
];

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const buildContext = (chunks) =>
  chunks
    .map(
      (chunk, i) =>
        `[Source ${i + 1}] Page ${chunk.pageNumber}, Paragraph ${chunk.paragraphNumber}:\n"${chunk.text}"`
    )
    .join('\n\n');

const askQuestion = async (question, relevantChunks) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const context = buildContext(relevantChunks);

  const prompt = `You are a helpful document assistant. Answer the user's question based ONLY on the provided document context below.

Rules:
1. Always cite your sources at the end of your answer using format: **[Source: Page X, Paragraph Y]**
2. If multiple sources are used, list all of them.
3. If the context does not contain enough information to answer, say: "I couldn't find relevant information in the document for this question."
4. Be concise and accurate.
5. Never fabricate information not present in the context.

Document Context:
${context}

Question: ${question}

Please answer based on the context above and cite the source(s).`;

  let lastError;

  for (const modelName of MODELS) {
    try {
      console.log(`[Gemini] Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const answer = result.response.text();
      console.log(`[Gemini] Success with model: ${modelName}`);

      const sources = relevantChunks.map((chunk) => ({
        page: chunk.pageNumber,
        paragraph: chunk.paragraphNumber,
        excerpt: chunk.text.substring(0, 150) + (chunk.text.length > 150 ? '...' : ''),
        chunkId: chunk.chunkId,
      }));

      return { answer, sources, model: modelName };
    } catch (err) {
      const msg = err.message || '';
      console.warn(`[Gemini] model=${modelName} failed: ${msg.substring(0, 120)}`);
      lastError = err.message;

      // If rate limited, extract retry delay and wait
      const retryMatch = msg.match(/retry in (\d+(\.\d+)?)s/i);
      if (retryMatch) {
        const waitMs = Math.min(Math.ceil(parseFloat(retryMatch[1])) * 1000, 15000);
        console.log(`[Gemini] Rate limited — waiting ${waitMs / 1000}s before next model...`);
        await sleep(waitMs);
      }
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError}`);
};

module.exports = { askQuestion };
