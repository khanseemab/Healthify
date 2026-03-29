const { TfIdf } = require('natural');

/**
 * In-memory vector store using TF-IDF for semantic search.
 * Stores the most recently uploaded PDF's chunks.
 */
class VectorStore {
  constructor() {
    this.chunks = [];
    this.tfidf = new TfIdf();
    this.currentDocId = null;
    this.fileName = null;
  }

  /**
   * Load a new document into the store, replacing any existing one.
   */
  loadDocument(docId, fileName, chunks) {
    this.chunks = [];
    this.tfidf = new TfIdf();
    this.currentDocId = docId;
    this.fileName = fileName;

    chunks.forEach((chunk) => {
      this.chunks.push(chunk);
      this.tfidf.addDocument(chunk.text.toLowerCase());
    });

    console.log(`[VectorStore] Loaded ${chunks.length} chunks from "${fileName}" (id: ${docId})`);
  }

  /**
   * Search for the most relevant chunks for a given query.
   * @param {string} query
   * @param {number} topK
   * @returns {Array} Top-k chunks with relevance scores
   */
  search(query, topK = 5) {
    if (this.chunks.length === 0) return [];

    const scores = [];
    this.tfidf.tfidfs(query.toLowerCase(), (i, measure) => {
      scores.push({ index: i, score: measure });
    });

    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, topK).map((s) => ({
      ...this.chunks[s.index],
      relevanceScore: s.score,
    }));
  }

  getStatus() {
    return {
      loaded: this.chunks.length > 0,
      docId: this.currentDocId,
      fileName: this.fileName,
      totalChunks: this.chunks.length,
    };
  }

  clear() {
    this.chunks = [];
    this.tfidf = new TfIdf();
    this.currentDocId = null;
    this.fileName = null;
  }
}

// Singleton instance
module.exports = new VectorStore();
