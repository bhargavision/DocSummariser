# Document Summary Assistant 📄

A web app that turns PDFs and images into concise, readable summaries.

The application extracts text from uploaded documents, uses OCR when necessary, and sends the extracted content to Google's Gemini API to generate a summary and key points. It also provides basic statistics so you can see how much the document was compressed.

## Features

-  Upload PDF and image files
-  Drag-and-drop file uploading
-  Extract text from PDFs
-  OCR support for scanned documents and images
-  AI-powered summarization using Google Gemini
-  Choose between short, medium, and long summaries
-  Automatically generate key points
-  View document statistics and compression ratio
-  Copy generated summaries to the clipboard
-  Download summaries as text files
-  Responsive interface for desktop, tablet, and mobile
-  Loading and error states for a better user experience

---

## Tech Stack

### Frontend

- **React 18** — User interface
- **CSS3** — Styling and responsive layout
- **Axios** — API requests
- **Tesseract.js** — OCR processing

### Backend

- **Node.js** — Runtime
- **Express.js** — REST API
- **pdf-parse** — PDF text extraction
- **Tesseract.js** — OCR for images/scanned documents
- **Google Gemini API** — Text summarization and key-point generation
- **Multer** — File upload handling
- **CORS** — Cross-origin request handling

### Deployment

- **Vercel** — Frontend and backend deployment
- **GitHub** — Source code and version control

---

## How It Works

The application follows a simple pipeline:

```text
             Upload PDF / Image
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
          │      Results        │
          │                     │
          │ • Summary           │
          │ • Key Points        │
          │ • Statistics        │
          └─────────────────────┘
