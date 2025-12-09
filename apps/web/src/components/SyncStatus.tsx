import { useState, useEffect } from 'react';
import type { SyncStatus as SyncStatusType } from '@librarydock/types';
import './SyncStatus.css';

const SyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatusType | null>(null);

  useEffect(() => {
    const fetchSyncStatus = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      try {
        const response = await fetch(`${apiUrl}/api/sync/status`);
        if (response.ok) {
          const data = await response.json();
          setSyncStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch sync status:', error);
      }
    };

    fetchSyncStatus();
    const interval = setInterval(fetchSyncStatus, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const triggerSync = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    try {
      await fetch(`${apiUrl}/api/sync/trigger`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to trigger sync:', error);
    }
  };

  return (
    <div className="sync-status-card">
      <h2>🔄 Sync Status</h2>

      {syncStatus ? (
        <div className="sync-info">
          <div className="status-row">
            <span className="label">Device:</span>
            <span className="value">{syncStatus.deviceName}</span>
          </div>

          <div className="status-row">
            <span className="label">Status:</span>
            <span className={`status-badge ${syncStatus.status}`}>{syncStatus.status}</span>
          </div>

          <div className="status-row">
            <span className="label">Last Sync:</span>
            <span className="value">{new Date(syncStatus.lastSyncTime).toLocaleString()}</span>
          </div>

          {syncStatus.error && (
            <div className="error-box">
              <strong>Error:</strong> {syncStatus.error}
            </div>
          )}
        </div>
      ) : (
        <div className="sync-loading">
          <p>Connecting to sync service...</p>
        </div>
      )}

      <button className="sync-btn" onClick={triggerSync}>
        Sync Now
      </button>

      <div className="sync-info-box">
        <h3>About Syncing</h3>
        <p>
          LibraryDock uses Syncthing to synchronize your ebook library across multiple devices
          securely and privately.
        </p>
      </div>
    </div>
  );
};

export default SyncStatus;
