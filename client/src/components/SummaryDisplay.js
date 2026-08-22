import React, { useState } from 'react';
import './SummaryDisplay.css';

function SummaryDisplay({ summary, keyPoints, statistics, fileName, onReset }) {
  const [copiedSection, setCopiedSection] = useState(null);

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const downloadAsText = () => {
    const content = `Document Summary Report
File: ${fileName}
Generated: ${new Date().toLocaleString()}

SUMMARY
-------
${summary}

KEY POINTS
----------
${keyPoints}

STATISTICS
----------
Original Document:
- Word Count: ${statistics.originalWordCount}
- Character Count: ${statistics.originalCharCount}

Summary:
- Word Count: ${statistics.summaryWordCount}
- Character Count: ${statistics.summaryCharCount}

Compression Ratio: ${statistics.compressionRatio}%
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `summary-${Date.now()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="summary-display">
      <div className="results-header">
        <div className="success-badge">Summary Generated</div>
        <h2>Document Analysis Complete</h2>
        <p className="file-info-text">File: <strong>{fileName}</strong></p>
      </div>

      <div className="result-card">
        <div className="card-header">
          <h3>Summary</h3>
          <button
            className="copy-btn"
            onClick={() => copyToClipboard(summary, 'summary')}
            title="Copy to clipboard"
          >
            {copiedSection === 'summary' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <div className="summary-text">
          {summary}
        </div>
      </div>

      <div className="result-card">
        <div className="card-header">
          <h3>Key Points</h3>
          <button
            className="copy-btn"
            onClick={() => copyToClipboard(keyPoints, 'keyPoints')}
            title="Copy to clipboard"
          >
            {copiedSection === 'keyPoints' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <div className="key-points-text">
          {keyPoints}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="statistics-grid">
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h4>Original Document</h4>
            <p className="stat-value">{statistics.originalWordCount.toLocaleString()}</p>
            <p className="stat-label">words</p>
            <p className="stat-detail">{statistics.originalCharCount.toLocaleString()} characters</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h4>Summary</h4>
            <p className="stat-value">{statistics.summaryWordCount.toLocaleString()}</p>
            <p className="stat-label">words</p>
            <p className="stat-detail">{statistics.summaryCharCount.toLocaleString()} characters</p>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h4>Compression</h4>
            <p className="stat-value">{statistics.compressionRatio}%</p>
            <p className="stat-label">reduction</p>
            <p className="stat-detail">condensed content</p>
          </div>
        </div>
      </div>

      <div className="action-section">
        <button
          className="btn btn-primary"
          onClick={downloadAsText}
        >
           Download Summary
        </button>
        <button
          className="btn btn-secondary"
          onClick={onReset}
        >
           Upload New Document
        </button>
      </div>

      <div className="info-box">
        <h4>Tips</h4>
        <ul>
          <li>You can download the summary as a text file for future reference</li>
          <li>Use the copy buttons to quickly share summaries with colleagues</li>
          <li>Upload another document to generate a new summary</li>
        </ul>
      </div>
    </div>
  );
}

export default SummaryDisplay;
