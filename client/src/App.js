import React, { useState } from 'react';
import './App.css';
import DocumentUpload from './components/DocumentUpload';
import SummaryDisplay from './components/SummaryDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorAlert from './components/ErrorAlert';

function App() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summaryLength, setSummaryLength] = useState('medium');
  const [statistics, setStatistics] = useState(null);
  const [stage, setStage] = useState('upload'); // 'upload', 'extracted', 'summarized'

  const handleFileUpload = async (uploadedFile) => {
    setError('');
    setLoading(true);
    setFile(uploadedFile);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'File extraction failed');
      }

      const data = await response.json();
      setExtractedText(data.extractedText);
      setStage('extracted');
    } catch (err) {
      setError(err.message || 'An error occurred while processing the file');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: extractedText,
          summaryLength: summaryLength
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Summary generation failed');
      }

      const data = await response.json();
      setSummary(data.summary);
      setKeyPoints(data.keyPoints);
      setStatistics(data.statistics);
      setStage('summarized');
    } catch (err) {
      setError(err.message || 'An error occurred while generating the summary');
      console.error('Summary error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setExtractedText('');
    setSummary('');
    setKeyPoints('');
    setError('');
    setStatistics(null);
    setStage('upload');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Document Summary Assistant</h1>
          <p>Upload documents and get intelligent summaries powered by AI</p>
        </div>
      </header>

      <main className="app-main">
        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        {loading && <LoadingSpinner message="Processing your document..." />}

        {!loading && (
          <>
            {stage === 'upload' && (
              <DocumentUpload onUpload={handleFileUpload} />
            )}

            {stage === 'extracted' && (
              <div className="extraction-stage">
                <div className="stage-header">
                  <h2>Text Extracted Successfully</h2>
                  <p>Review the extracted text below, then generate a summary</p>
                </div>

                <div className="extracted-content">
                  <div className="text-preview">
                    <h3>Extracted Text Preview</h3>
                    <div className="preview-box">
                      {extractedText.substring(0, 500)}
                      {extractedText.length > 500 && '...'}
                    </div>
                    <p className="text-stats">
                      Word count: {extractedText.split(/\s+/).filter(w => w.length > 0).length} words
                    </p>
                  </div>

                  <div className="summary-options">
                    <div className="length-selector">
                      <label>Summary Length:</label>
                      <div className="radio-group">
                        <label className="radio-option">
                          <input
                            type="radio"
                            value="short"
                            checked={summaryLength === 'short'}
                            onChange={(e) => setSummaryLength(e.target.value)}
                          />
                          <span>Short (150-200 words)</span>
                        </label>
                        <label className="radio-option">
                          <input
                            type="radio"
                            value="medium"
                            checked={summaryLength === 'medium'}
                            onChange={(e) => setSummaryLength(e.target.value)}
                          />
                          <span>Medium (300-400 words)</span>
                        </label>
                        <label className="radio-option">
                          <input
                            type="radio"
                            value="long"
                            checked={summaryLength === 'long'}
                            onChange={(e) => setSummaryLength(e.target.value)}
                          />
                          <span>Long (500-700 words)</span>
                        </label>
                      </div>
                    </div>

                    <div className="action-buttons">
                      <button
                        className="btn btn-primary"
                        onClick={handleGenerateSummary}
                        disabled={loading}
                      >
                        Generate Summary
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleReset}
                      >
                        Upload New Document
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stage === 'summarized' && (
              <SummaryDisplay
                summary={summary}
                keyPoints={keyPoints}
                statistics={statistics}
                fileName={file?.name}
                onReset={handleReset}
              />
            )}
          </>
        )}
      </main>

     
    </div>
  );
}

export default App;
