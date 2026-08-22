const express = require('express');
const multer = require('multer');
const path = require('path');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const fs = require('fs').promises;

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload PDF or image files only.'));
    }
  }
});

// Extract text from PDF
const extractPdfText = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    const text = data.text;
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text found in PDF. The PDF might be scanned or image-based.');
    }
    
    return {
      text,
      pageCount: data.numpages,
      metadata: {
        producer: data.info?.Producer || 'Unknown',
        creationDate: data.info?.CreationDate || 'Unknown'
      }
    };
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

// Extract text from image using OCR
const extractImageText = async (buffer) => {
  try {
    // Convert buffer to base64 for Tesseract
    const base64 = buffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    const result = await Tesseract.recognize(buffer, 'eng', {
      logger: (info) => {
        console.log(`OCR Progress: ${(info.progress * 100).toFixed(2)}%`);
      }
    });

    const text = result.data.text;
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text found in image. The image might be too unclear or empty.');
    }

    return {
      text,
      confidence: result.data.confidence,
      metadata: {
        language: 'English'
      }
    };
  } catch (error) {
    throw new Error(`OCR extraction failed: ${error.message}`);
  }
};

// POST endpoint for text extraction
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileType = req.file.mimetype;
    let extractionResult;

    if (fileType === 'application/pdf') {
      extractionResult = await extractPdfText(req.file.buffer);
    } else if (fileType.startsWith('image/')) {
      extractionResult = await extractImageText(req.file.buffer);
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    res.json({
      success: true,
      fileName: req.file.originalname,
      fileType: fileType.includes('pdf') ? 'pdf' : 'image',
      extractedText: extractionResult.text,
      metadata: extractionResult.metadata,
      charCount: extractionResult.text.length,
      wordCount: extractionResult.text.split(/\s+/).filter(w => w.length > 0).length
    });
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(400).json({
      error: 'Extraction failed',
      message: error.message
    });
  }
});

module.exports = router;
