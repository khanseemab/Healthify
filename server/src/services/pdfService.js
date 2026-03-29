const pdfParse = require('pdf-parse');

/**
 * Extracts text chunks from a PDF buffer with page and paragraph metadata.
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Array} Array of chunks with text, pageNumber, paragraphNumber, lines
 */
const extractChunksFromPDF = async (buffer) => {
  const chunks = [];

  // pdf-parse gives us page-level text via render_page option
  let pageTexts = [];

  const options = {
    pagerender: (pageData) => {
      return pageData.getTextContent().then((textContent) => {
        let lastY = null;
        let lines = [];
        let currentLine = '';

        textContent.items.forEach((item) => {
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 2) {
            if (currentLine.trim()) lines.push(currentLine.trim());
            currentLine = item.str;
          } else {
            currentLine += item.str;
          }
          lastY = item.transform[5];
        });
        if (currentLine.trim()) lines.push(currentLine.trim());

        pageTexts.push(lines);
        return lines.join('\n');
      });
    },
  };

  await pdfParse(buffer, options);

  pageTexts.forEach((lines, pageIndex) => {
    const pageNumber = pageIndex + 1;
    const fullText = lines.join('\n');

    // Split into paragraphs by double newline or multiple blank lines
    const paragraphs = fullText
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 20);

    if (paragraphs.length === 0 && fullText.trim().length > 0) {
      // fallback: treat whole page as one chunk
      chunks.push({
        text: fullText.trim(),
        pageNumber,
        paragraphNumber: 1,
        lines: lines,
        chunkId: `page${pageNumber}_para1`,
      });
      return;
    }

    paragraphs.forEach((para, paraIndex) => {
      chunks.push({
        text: para,
        pageNumber,
        paragraphNumber: paraIndex + 1,
        lines: para.split('\n').map((l) => l.trim()).filter(Boolean),
        chunkId: `page${pageNumber}_para${paraIndex + 1}`,
      });
    });
  });

  return chunks;
};

module.exports = { extractChunksFromPDF };
