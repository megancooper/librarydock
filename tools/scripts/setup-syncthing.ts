/**
 * Setup script for Syncthing configuration
 * Run with: npx ts-node tools/scripts/setup-syncthing.ts
 */

interface SyncthingConfig {
  url: string;
  apiKey: string;
  libraryPath: string;
}

async function checkSyncthingConnection(config: SyncthingConfig): Promise<boolean> {
  try {
    const response = await fetch(`${config.url}/rest/system/ping`, {
      headers: {
        'X-API-Key': config.apiKey,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log('LibraryDock - Syncthing Setup Script');
  console.log('=====================================\n');

  const config: SyncthingConfig = {
    url: process.env.SYNCTHING_URL || 'http://localhost:8384',
    apiKey: process.env.SYNCTHING_API_KEY || '',
    libraryPath: process.env.LIBRARY_PATH || './library',
  };

  console.log('Configuration:');
  console.log(`  Syncthing URL: ${config.url}`);
  console.log(`  Library Path: ${config.libraryPath}`);
  console.log(`  API Key: ${config.apiKey ? '***configured***' : 'NOT SET'}\n`);

  if (!config.apiKey) {
    console.error('ERROR: SYNCTHING_API_KEY environment variable is not set.');
    console.log('\nTo find your API key:');
    console.log('1. Open Syncthing web UI');
    console.log('2. Go to Actions > Settings > GUI');
    console.log('3. Copy the API Key\n');
    process.exit(1);
  }

  console.log('Testing connection to Syncthing...');
  const connected = await checkSyncthingConnection(config);

  if (connected) {
    console.log('✓ Successfully connected to Syncthing!\n');
  } else {
    console.error('✗ Failed to connect to Syncthing.');
    console.log('\nPlease ensure:');
    console.log('1. Syncthing is running');
    console.log('2. The URL is correct');
    console.log('3. The API key is valid\n');
    process.exit(1);
  }

  console.log('Setup complete!');
}

main().catch(console.error);
