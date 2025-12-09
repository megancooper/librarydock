import { useState } from 'react';
import type { UploadProgress } from '@librarydock/types';
import './UploadArea.css';

interface UploadAreaProps {
  onFileUpload: (files: FileList) => void;
  uploadProgress: UploadProgress[];
}

const UploadArea = ({ onFileUpload, uploadProgress }: UploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files);
    }
  };

  return (
    <div className="upload-section">
      <div
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon">📖</div>
        <h3>Upload Your Ebooks</h3>
        <p>Drag and drop files here, or click to browse</p>
        <input
          type="file"
          id="file-input"
          multiple
          accept=".epub,.pdf,.mobi,.azw3,.txt"
          onChange={handleFileInput}
          className="file-input"
        />
        <label htmlFor="file-input" className="upload-btn">
          Choose Files
        </label>
        <p className="supported-formats">Supported: EPUB, PDF, MOBI, AZW3, TXT</p>
      </div>

      {uploadProgress.length > 0 && (
        <div className="upload-progress-list">
          {uploadProgress.map((progress) => (
            <div key={progress.ebookId} className="upload-progress-item">
              <div className="progress-info">
                <span className="file-name">{progress.fileName}</span>
                <span className={`status ${progress.status}`}>{progress.status}</span>
              </div>
              {progress.status === 'uploading' && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress.progress}%` }} />
                </div>
              )}
              {progress.error && <span className="error-message">{progress.error}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadArea;
