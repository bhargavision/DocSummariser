import React, { useCallback, useState } from 'react';
import './DocumentUpload.css';
import uploadIcon from '../imgs/upload.svg';

function DocumentUpload({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onUpload(file);
      }
    }
  }, [onUpload]);

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onUpload(file);
    }
  };

  const validateFile = (file) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a PDF or image file (PNG, JPG, JPEG, WebP).');
      return false;
    }

    if (file.size > maxSize) {
      alert('File is too large. Maximum size is 50MB.');
      return false;
    }

    return true;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div
          className={`upload-zone ${isDragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="upload-icon"><img src={uploadIcon} alt="Upload document" /></div>
          <h2>Upload Your Document</h2>
          <p className="upload-instruction">
            Drag and drop your file here, or click to browse
          </p>

          <input
            type="file"
            id="file-input"
            className="file-input"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={handleFileInputChange}
          />

          <label htmlFor="file-input" className="browse-btn">
            Choose File
          </label>

          <p className="upload-info">
            Supported formats: PDF, PNG, JPG, JPEG, WebP<br />
            Maximum file size: 50MB
          </p>
        </div>

        {selectedFile && (
          <div className="selected-file">
            <div className="file-info">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <p className="file-name">{selectedFile.name}</p>
                <p className="file-size">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="upload-examples">
          <h3>Example Use Cases:</h3>
          <ul>
            <li>Extract summaries from news articles or research papers</li>
            <li>Summarize lengthy PDF documents</li>
            <li>Extract text and summarize scanned documents or images</li>
            <li>Generate key points from business reports</li>
            <li>Create concise summaries of academic materials</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DocumentUpload;
