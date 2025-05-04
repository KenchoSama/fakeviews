import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.css';
import csusmLogo from './csusm-logo.png';

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', imageFile);
      const response = await fetch(`http://localhost:8000/predict/`, {
        method: 'POST',
        body: form,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Image Detector</h1>
        <p>Upload an image to check if it's AI-generated or real</p>
      </header>

      <main className="App-main">
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} />
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="preview-image" />
          ) : (
            <p>Tap here or drag & drop an image to analyze</p>
          )}
        </div>

        {imagePreview && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="analyze-button"
          >
            {loading ? 'Analyzing...' : 'Analyze Image'}
          </button>
        )}

        {result && (
          <div className="result-container">
            <h2>Analysis Results</h2>
            <p>
              Image Type:{' '}
              {result.label === 'fake' ? 'AI Generated' : 'Real'}
            </p>
            <p>Confidence: {result.confidence}%</p>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <div className="footer-content">
          <img src={csusmLogo} alt="CSUSM Logo" className="footer-logo" />
          <p className="footer-text">Production of BrokenAI</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
