import type { Ebook } from '@librarydock/types';
import './EbookList.css';

interface EbookListProps {
  ebooks: Ebook[];
  onDelete: (id: string) => void;
}

const EbookList = ({ ebooks, onDelete }: EbookListProps) => {
  if (ebooks.length === 0) {
    return (
      <div className="ebook-list-empty">
        <p>No ebooks yet. Upload some to get started!</p>
      </div>
    );
  }

  return (
    <div className="ebook-list">
      <h2>Your Library ({ebooks.length})</h2>
      <div className="ebook-grid">
        {ebooks.map((ebook) => (
          <div key={ebook.id} className="ebook-card">
            {ebook.coverImage && (
              <img src={ebook.coverImage} alt={ebook.title} className="ebook-cover" />
            )}
            {!ebook.coverImage && (
              <div className="ebook-cover-placeholder">
                <span className="format-badge">{ebook.format.toUpperCase()}</span>
              </div>
            )}
            <div className="ebook-info">
              <h3 className="ebook-title">{ebook.title}</h3>
              <p className="ebook-author">{ebook.author}</p>
              {ebook.description && (
                <p className="ebook-description">{ebook.description}</p>
              )}
              <div className="ebook-meta">
                <span className="ebook-format">{ebook.format}</span>
                <span className="ebook-size">{formatFileSize(ebook.fileSize)}</span>
              </div>
              <button className="delete-btn" onClick={() => onDelete(ebook.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export default EbookList;
