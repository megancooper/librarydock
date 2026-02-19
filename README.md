# LibraryDock

A self-hosted ebook management and synchronization application.

## Overview

LibraryDock allows you to:

- Upload and manage ebooks on your local devices
- Synchronize ebooks between multiple devices using Syncthing
- Access your ebook library through a web interface

## Project Structure

```
librarydock/
├── apps/
│   ├── web/          # React + Vite web application
│   └── api/          # Hono.js backend API
├── libs/
│   ├── shared/
│   │   ├── types/    # Shared TypeScript types
│   │   └── utils/    # Shared utility functions
│   └── ui/           # Shared UI components
└── tools/
    └── scripts/      # Setup and utility scripts
```

## Prerequisites

- Node.js 18+
- npm or yarn
- Docker & Docker Compose
- [Syncthing](https://syncthing.net/) (runs via Docker)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Syncthing

1. Install and start Syncthing on your machine
2. Get your Syncthing API key from the web UI (Actions > Settings > GUI)
3. Create a `.env` file in the root:

```env
SYNCTHING_URL=http://localhost:8385
SYNCTHING_API_KEY=your-api-key-here
LIBRARY_PATH=./library
```

### 3. Run the Applications

**Start the API server:**

```bash
npm run start:api
```

**Start the web app:**

```bash
npm run start:web
```

## Available Scripts

| Script                 | Description                           |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Start all services via Docker Compose |
| `npm run dev:stop`     | Stop all services                     |
| `npm run dev:logs`     | Tail logs from all services           |
| `npm run start:web`    | Start the web app (without Docker)    |
| `npm run start:api`    | Start the API server (without Docker) |
| `npm run build:web`    | Build the web app for production      |
| `npm run build:api`    | Build the API for production          |
| `npm run test`         | Run all tests                         |
| `npm run lint`         | Lint all projects                     |

## API Endpoints

### Ebooks

- `GET /api/ebooks` - List all ebooks
- `GET /api/ebooks/:id` - Get a single ebook
- `POST /api/ebooks` - Upload a new ebook
- `PUT /api/ebooks/:id` - Update ebook metadata
- `DELETE /api/ebooks/:id` - Delete an ebook

### Sync

- `GET /api/sync/status` - Get Syncthing connection status
- `GET /api/sync/devices` - List connected devices
- `POST /api/sync/devices` - Add a new device
- `GET /api/sync/folders` - List synced folders
- `POST /api/sync/folders` - Add a folder to sync
- `POST /api/sync/trigger` - Trigger manual sync

## Technology Stack

- **Web App:** React, TypeScript, Vite, Tailwind CSS, TanStack Router
- **Backend:** Hono.js, Node.js
- **Sync:** Syncthing
- **Monorepo:** Nx
- **Dev Environment:** Docker Compose

## License

MIT
