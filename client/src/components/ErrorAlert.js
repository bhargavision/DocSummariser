import React, { useEffect } from 'react';
import './ErrorAlert.css';

function ErrorAlert({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="error-alert">
      <div className="error-alert-content">
        <div className="error-alert-title">Error!</div>
        <div className="error-alert-message">{message}</div>
      </div>
      <button onClick={onClose} className="error-alert-close">
        ×
      </button>
    </div>
  );
}

export default ErrorAlert;
