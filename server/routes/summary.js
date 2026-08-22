const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const router = express.Router();

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

// Length configuration for summaries
const lengthConfig = {
  short: {
    instructions:
      'Provide a concise summary in 2-3 paragraphs, approximately 150-200 words. Focus only on the most critical points.',
  },
  medium: {
    instructions:
      'Provide a comprehensive summary in 4-5 paragraphs, approximately 300-400 words. Include the main points and important supporting details.',
  },
  long: {
    instructions:
      'Provide a detailed summary in 6-8 paragraphs, approximately 500-700 words. Include all major points, supporting details, explanations, and examples.',
  },
};

// Gemini structured output schema.
// This makes the response predictable and avoids needing two API calls.
const responseSchema = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: 'The generated summary of the document.',
    },
    keyPoints: {
      type: 'array',
      description: 'The 5-7 most important points from the document.',
      items: {
        type: 'string',
      },
    },
  },
  required: ['summary', 'keyPoints'],
};

// POST endpoint for summary generation
router.post('/', async (req, res) => {
  try {
    const { text, summaryLength = 'medium' } = req.body;

    // Validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Text parameter is required and must be a string',
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Text cannot be empty',
      });
    }

    if (!['short', 'medium', 'long'].includes(summaryLength)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'summaryLength must be "short", "medium", or "long"',
      });
    }

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Configuration error',
        message:
          'Gemini API key not configured. Add GEMINI_API_KEY to server/.env',
      });
    }

    const config = lengthConfig[summaryLength];

    // Initialize Gemini only after validating the API key.
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are an expert document summarization assistant.

Your task is to analyze the provided document and produce:
1. A high-quality summary.
2. 5-7 important key points.

Summary requirements:
${config.instructions}

Key point requirements:
- Extract 5-7 of the most important ideas.
- Each point should be concise and informative.
- Do not invent information that is not present in the document.
- Preserve important names, numbers, dates, technical terms, and conclusions.
- Avoid repeating the same idea.
- Focus on information that would help someone understand the document without reading it completely.

Important:
- Base your response ONLY on the supplied document.
- Do not mention that you are an AI.
- Do not add introductory or concluding commentary outside the requested content.

Document:
--------------------
${text}
--------------------
`;

    // One Gemini request generates both summary and key points.
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    if (!response || !response.text) {
      throw new Error('Gemini returned an empty response');
    }

    let result;

    try {
      result = JSON.parse(response.text);
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', response.text);

      return res.status(500).json({
        error: 'Invalid AI response',
        message: 'Gemini returned an invalid structured response',
      });
    }

    const summary =
      typeof result.summary === 'string' ? result.summary.trim() : '';

    const keyPointsArray = Array.isArray(result.keyPoints)
      ? result.keyPoints.filter(
          (point) => typeof point === 'string' && point.trim().length > 0
        )
      : [];

    // Keep the existing API response format expected by the frontend.
    // The frontend currently expects keyPoints to be text, so convert
    // the structured array into a bullet list.
    const keyPoints = keyPointsArray
      .map((point) => `• ${point.trim()}`)
      .join('\n');

    if (!summary) {
      throw new Error('Gemini did not return a summary');
    }

    const originalWords = text
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const summaryWords = summary
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const originalWordCount = originalWords.length;
    const summaryWordCount = summaryWords.length;

    const compressionRatio =
      originalWordCount > 0
        ? (
            (1 - summaryWordCount / originalWordCount) *
            100
          ).toFixed(2)
        : '0.00';

    res.json({
      success: true,
      summary,
      keyPoints,
      summaryLength,
      statistics: {
        originalCharCount: text.length,
        originalWordCount,
        summaryCharCount: summary.length,
        summaryWordCount,
        compressionRatio,
      },
    });
  } catch (error) {
    console.error('Summary generation error:', error);

    // Authentication / invalid API key
    if (
      error.status === 401 ||
      error.status === 403 ||
      error.code === 401 ||
      error.code === 403
    ) {
      return res.status(401).json({
        error: 'Authentication error',
        message: 'Invalid or unauthorized Gemini API key',
      });
    }

    // Rate limit
    if (
      error.status === 429 ||
      error.code === 429 ||
      error.message?.toLowerCase().includes('rate limit')
    ) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message:
          'Gemini free-tier rate limit reached. Please wait and try again later.',
      });
    }

    // Gemini API errors
    if (error.status >= 400 && error.status < 500) {
      return res.status(error.status).json({
        error: 'Gemini API error',
        message: error.message || 'Gemini rejected the request',
      });
    }

    res.status(500).json({
      error: 'Summary generation failed',
      message:
        error.message ||
        'An error occurred while generating the summary',
    });
  }
});

module.exports = router;
