const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-haiku-4-5'; // fast & cost-effective; change to claude-opus-4-6 for best quality

const buildContext = (chunks) =>
  chunks
    .map(
      (chunk, i) =>
        `[Source ${i + 1}] Page ${chunk.pageNumber}, Paragraph ${chunk.paragraphNumber}:\n"${chunk.text}"`
    )
    .join('\n\n');

const askQuestion = async (question, relevantChunks) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const client = new Anthropic({ apiKey });
  const context = buildContext(relevantChunks);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `You are a helpful document assistant. Answer the user's question based ONLY on the provided document context.

Rules:
1. Always cite your sources at the end of your answer using format: **[Source: Page X, Paragraph Y]**
2. If multiple sources are used, list all of them.
3. If the context does not contain enough information to answer, say: "I couldn't find relevant information in the document for this question."
4. Be concise and accurate.
5. Never fabricate information not present in the context.`,
    messages: [
      {
        role: 'user',
        content: `Document Context:\n${context}\n\nQuestion: ${question}\n\nPlease answer based on the context above and cite the source(s).`,
      },
    ],
  });

  const answer = response.content[0].text;

  const sources = relevantChunks.map((chunk) => ({
    page: chunk.pageNumber,
    paragraph: chunk.paragraphNumber,
    excerpt: chunk.text.substring(0, 150) + (chunk.text.length > 150 ? '...' : ''),
    chunkId: chunk.chunkId,
  }));

  return { answer, sources, model: MODEL };
};

module.exports = { askQuestion };
