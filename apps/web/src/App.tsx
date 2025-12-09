import { useState } from 'react';
import type { Ebook, UploadProgress } from '@librarydock/types';
import EbookList from './components/EbookList';
import UploadArea from './components/UploadArea';
import SyncStatus from './components/SyncStatus';
import './App.css';

function App() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  const handleFileUpload = async (files: FileList) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('ebook', file);

      const progressItem: UploadProgress = {
        ebookId: `temp-${Date.now()}-${i}`,
        fileName: file.name,
        progress: 0,
        status: 'uploading',
      };

      setUploadProgress((prev) => [...prev, progressItem]);

      try {
        const response = await fetch(`${apiUrl}/api/ebooks/upload`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const newEbook: Ebook = await response.json();
          setEbooks((prev) => [...prev, newEbook]);
          setUploadProgress((prev) =>
            prev.map((p) =>
              p.ebookId === progressItem.ebookId ? { ...p, status: 'completed', progress: 100 } : p
            )
          );
        } else {
          setUploadProgress((prev) =>
            prev.map((p) =>
              p.ebookId === progressItem.ebookId
                ? { ...p, status: 'error', error: 'Upload failed' }
                : p
            )
          );
        }
      } catch (error) {
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.ebookId === progressItem.ebookId
              ? { ...p, status: 'error', error: String(error) }
              : p
          )
        );
      }
    }

    // Clear completed uploads after 3 seconds
    setTimeout(() => {
      setUploadProgress((prev) => prev.filter((p) => p.status !== 'completed'));
    }, 3000);
  };

  const handleDeleteEbook = async (id: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    try {
      const response = await fetch(`${apiUrl}/api/ebooks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEbooks((prev) => prev.filter((ebook) => ebook.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete ebook:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 LibraryDock</h1>
        <p className="subtitle">Manage and sync your ebook collection</p>
      </header>

      <div className="app-container">
        <aside className="sidebar">
          <SyncStatus />
        </aside>

        <main className="main-content">
          <UploadArea onFileUpload={handleFileUpload} uploadProgress={uploadProgress} />
          <EbookList ebooks={ebooks} onDelete={handleDeleteEbook} />
        </main>
      </div>
    </div>
  );
}

export default App;
