const { v4: uuidv4 } = require('uuid');
const { extractChunksFromPDF } = require('../services/pdfService');
const vectorStore = require('../services/vectorStore');
const { askQuestion } = require('../services/claudeService');

/**
 * POST /api/ai/upload
 * Upload and process a PDF file, store embeddings in memory.
 */
const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
    }

    const { originalname } = req.file;
    // multer v2 may return Uint8Array; pdf-parse needs a Buffer
    const buffer = Buffer.isBuffer(req.file.buffer)
      ? req.file.buffer
      : Buffer.from(req.file.buffer);
    const docId = uuidv4();

    const chunks = await extractChunksFromPDF(buffer);

    if (chunks.length === 0) {
      return res.status(422).json({ success: false, message: 'Could not extract text from PDF. The file may be scanned or empty.' });
    }

    vectorStore.loadDocument(docId, originalname, chunks);

    res.json({
      success: true,
      message: `PDF processed successfully. Extracted ${chunks.length} chunks.`,
      docId,
      fileName: originalname,
      totalChunks: chunks.length,
      totalPages: Math.max(...chunks.map((c) => c.pageNumber)),
    });
  } catch (error) {
    console.error('[uploadPDF] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/ai/ask
 * Ask a question about the currently loaded PDF.
 */
const askPDF = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question is required.' });
    }

    const status = vectorStore.getStatus();
    if (!status.loaded) {
      return res.status(404).json({ success: false, message: 'No PDF loaded. Please upload a PDF first.' });
    }

    const relevantChunks = vectorStore.search(question, 5);

    if (relevantChunks.length === 0) {
      return res.json({
        success: true,
        answer: "I couldn't find relevant information in the document for this question.",
        sources: [],
      });
    }

    const { answer, sources } = await askQuestion(question, relevantChunks);

    res.json({
      success: true,
      answer,
      sources,
      docId: status.docId,
      fileName: status.fileName,
    });
  } catch (error) {
    console.error('[askPDF] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/ai/status
 * Get the current document status.
 */
const getStatus = (req, res) => {
  const status = vectorStore.getStatus();
  res.json({ success: true, ...status });
};

/**
 * DELETE /api/ai/document
 * Clear the current loaded document.
 */
const clearDocument = (req, res) => {
  vectorStore.clear();
  res.json({ success: true, message: 'Document cleared.' });
};

module.exports = { uploadPDF, askPDF, getStatus, clearDocument };
