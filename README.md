# [Document Summary Assistant](https://doc-summary-app-rho.vercel.app/) 

A web application that turns PDFs and images into concise, readable summaries.

The app extracts text from uploaded documents, uses OCR when necessary, and sends the extracted content to **Google Gemini** to generate a summary and key points. It also provides document statistics, including word counts and compression ratio.

## Features

*  Upload PDF and image files
*  Drag-and-drop file uploading
*  Extract text from PDFs
*  OCR support for scanned documents and images
*  AI-powered summarization using Google Gemini
*  Short, medium, and long summary options
*  Automatic key-point extraction
*  Document statistics and compression ratio
*  Copy summaries and key points to clipboard
*  Download generated summaries as text files
*  Responsive design for desktop, tablet, and mobile
*  Loading and error states for a smoother experience

---

## Tech Stack

### Frontend

* **React 18** — User interface
* **CSS3** — Styling and responsive layout
* **Axios** — API requests
* **Tesseract.js** — OCR processing

### Backend

* **Node.js** — Runtime
* **Express.js** — REST API
* **pdf-parse** — PDF text extraction
* **Tesseract.js** — OCR for images and scanned documents
* **Google Gemini API** — AI summarization
* **Multer** — File upload handling
* **CORS** — Cross-origin request handling

### Deployment

* **Vercel** — Production deployment
* **GitHub** — Source control

---

## How It Works

The application follows a simple document-processing pipeline:

```text
              Upload Document
                     │
                     ▼
              File Validation
                     │
                     ▼
          ┌─────────────────────┐
          │   Text Extraction   │
          │                     │
          │ PDF → pdf-parse     │
          │ Image → Tesseract   │
          └─────────────────────┘
                     │
                     ▼
              Extracted Text
                     │
                     ▼
             Google Gemini API
                     │
                     ▼
          ┌─────────────────────┐
          │       Results       │
          │                     │
          │ • Summary           │
          │ • Key Points        │
          │ • Statistics        │
          └─────────────────────┘
```

For regular PDFs containing selectable text, `pdf-parse` is used. For images and scanned documents, Tesseract.js performs OCR before the text is sent for summarization.

---

# Getting Started

## Prerequisites

Make sure you have:

* Node.js 20+
* npm
* A Google Gemini API key

A Gemini API key can be created through [Google AI Studio](https://aistudio.google.com/).

---

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd DocSummary
```

### 2. Install dependencies

Install the root dependencies:

```bash
npm install
```

Install the server dependencies:

```bash
cd server
npm install
```

Install the client dependencies:

```bash
cd ../client
npm install
```

Return to the project root:

```bash
cd ..
```

---

## Environment Variables

The Gemini API key should **never be committed to Git**.

For local development, create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
NODE_ENV=development
```

If the backend uses its own environment file, you can also configure:

```text
server/.env
```

with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Make sure `.env` files are included in `.gitignore`.

For production, configure `GEMINI_API_KEY` through Vercel's environment variables instead of putting the key in the repository.

---

# Running Locally

From the project root:

```bash
npm run dev
```

This starts both the frontend and backend.

The application will be available at:

```text
Frontend:
http://localhost:3000

Backend:
http://localhost:5000
```

### Run the server separately

```bash
cd server
npm run dev
```

### Run the frontend separately

```bash
cd client
npm start
```

---

# API Endpoints

## Extract Text

```http
POST /api/extract
Content-Type: multipart/form-data
```

### Form Data

```text
file: <PDF or image file>
```

### Example Response

```json
{
  "success": true,
  "fileName": "document.pdf",
  "fileType": "pdf",
  "extractedText": "...",
  "metadata": {},
  "charCount": 5000,
  "wordCount": 800
}
```

---

## Generate Summary

```http
POST /api/summary
Content-Type: application/json
```

### Request

```json
{
  "text": "Document text to summarize",
  "summaryLength": "medium"
}
```

Supported summary lengths:

```text
short
medium
long
```

### Example Response

```json
{
  "success": true,
  "summary": "...",
  "keyPoints": "...",
  "summaryLength": "medium",
  "statistics": {
    "originalCharCount": 5000,
    "originalWordCount": 800,
    "summaryCharCount": 2000,
    "summaryWordCount": 300,
    "compressionRatio": "62.5"
  }
}
```

---

# Project Structure

```text
DocSummary/
│
├── client/
│   ├── public/
    │   ├── index.html 
│   ├── src/
│   │   ├── components/
│   │   ├── imgs/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
│
├── server/
│   ├── routes/
│   │   ├── extract.js
│   │   └── summary.js
│   ├── uploads/
│   ├── index.js
│   └── package.json
│
├── .gitignore
├── package.json
├── vercel.json
└── README.md
```

---

# Design & Architecture

## Frontend / Backend Separation

The application is divided into two main parts:

* **React frontend** — Handles the UI, file selection, summary options, and displaying results.
* **Express backend** — Handles document processing and communication with the Gemini API.

Keeping the Gemini API interaction on the backend prevents the API key from being exposed in the browser.

## Text Extraction

### PDF

```text
PDF
 │
 ▼
pdf-parse
 │
 ▼
Extracted Text
```

### Image / Scanned Document

```text
Image
 │
 ▼
Tesseract.js
 │
 ▼
OCR Text
```

The extracted text is then passed to the summarization endpoint.

## Summarization

The backend sends the extracted document text to Google's Gemini API along with instructions based on the selected summary length.

The response is then processed to provide:

* Summary
* Key points
* Word and character counts
* Compression ratio

---

# Usage

### 1. Upload a document

Drag a file into the upload area or select one using the file picker.

Supported formats:

```text
PDF
PNG
JPG
JPEG
WebP
```

Maximum file size:

```text
50 MB
```

### 2. Extract the text

The application determines how the document should be processed.

* Text-based PDFs are parsed directly.
* Images and scanned documents are processed using OCR.

### 3. Select summary length

Choose between:

* **Short** — Quick overview
* **Medium** — Balanced summary
* **Long** — More detailed summary

### 4. Generate the summary

Gemini processes the extracted text and generates the summary and key points.

### 5. Review the results

The results page displays:

* Summary
* Key points
* Word count
* Character count
* Compression ratio
* Document statistics

You can also copy the generated content or download it as a text file.

---

# Deployment

The application is deployed using **Vercel**.

## Deploy with Vercel CLI

Install the Vercel CLI:

```bash
npm install -g vercel
```

Log in:

```bash
vercel login
```

From the project root:

```bash
vercel
```

For a production deployment:

```bash
vercel --prod
```

## Environment Variables

Add the following environment variable to the Vercel project:

```text
GEMINI_API_KEY
```

Configure it for the environments where the application will run.

The API key should **not** be added to `vercel.json` or committed to GitHub.

---

# Security

API credentials are stored using environment variables.

Never put the Gemini API key directly into:

* React components
* Frontend JavaScript
* `vercel.json`
* Git commits
* Public repositories

For local development, keep:

```text
.env
server/.env
```

out of version control.

For production, use Vercel's Environment Variables.

---

# Error Handling

The application handles common problems such as:

* Unsupported file formats
* Files larger than 50 MB
* PDF extraction failures
* OCR failures
* Empty extracted text
* Gemini API errors
* Network failures
* Missing API configuration

Errors are displayed through the application's UI without exposing unnecessary server-side details.

---

# Performance

Processing time depends on document size, image quality, and API response time.

Typical processing times can vary:

| Operation           |            Typical Time |
| ------------------- | ----------------------: |
| PDF text extraction |             < 2 seconds |
| OCR                 |           3–10+ seconds |
| AI summarization    | Depends on API response |
| Frontend loading    |           A few seconds |

OCR generally takes longer than normal PDF extraction because the image has to be analyzed character by character.

---

# Testing

The application can be tested with:

### Text-based PDF

A normal PDF containing selectable text.

### Scanned document

A scanned PDF or photograph of a document.

### Image

A PNG, JPG, JPEG, or WebP containing readable text.

### Large document

A longer document can be used to test the different summary lengths and compression statistics.

---

# Future Improvements

Some ideas for future versions:

* [ ] Batch processing multiple documents
* [ ] Custom summarization prompts
* [ ] Document comparison
* [ ] Export summaries to PDF
* [ ] Export summaries to Word
* [ ] Multi-language OCR
* [ ] Multi-language summarization
* [ ] Google Drive integration
* [ ] OneDrive integration
* [ ] Summary history
* [ ] User accounts
* [ ] Advanced document analytics

---

# Acknowledgments

This project uses several open-source technologies:

* Inspired by the [Iceberg](https://github.com/oahlen/iceberg.nvim) color scheme by oahlen.
* [React](https://react.dev/)
* [Node.js](https://nodejs.org/)
* [Express](https://expressjs.com/)
* [Tesseract.js](https://github.com/naptha/tesseract.js)
* [pdf-parse](https://www.npmjs.com/package/pdf-parse)
* [Axios](https://axios-http.com/)
* [Multer](https://github.com/expressjs/multer)
* [Google Gemini API](https://ai.google.dev/)

---

## Project Status

**Version:** 1.0.0

**Status:** Production Ready 

The application is currently deployed on Vercel and supports PDF/image upload, text extraction, OCR, and AI-powered document summarization.

