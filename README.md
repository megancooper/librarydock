# 📚 LibraryDock

A self-hosted ebook management and synchronization application built with Turborepo. LibraryDock helps you manage your ebook collection and sync it across multiple devices using Syncthing.

## Features

- 📖 **Upload and Manage Ebooks**: Support for EPUB, PDF, MOBI, AZW3, and TXT formats
- 🔄 **Device Synchronization**: Sync your library across devices using Syncthing
- 🌐 **Web Application**: React-based web interface with Vite
- 📱 **Mobile App**: React Native app for iOS and Android
- 🚀 **Fast API**: Hono.js-based backend for high performance
- 🏗️ **Monorepo Architecture**: Built with Turborepo for scalability

## Architecture

This project is a Turborepo monorepo containing:

### Apps

- **`apps/web`**: React + TypeScript + Vite web application
- **`apps/mobile`**: React Native mobile application
- **`apps/api`**: Hono.js API server with Syncthing integration

### Packages

- **`packages/types`**: Shared TypeScript type definitions
- **`packages/tsconfig`**: Shared TypeScript configurations

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- [Syncthing](https://syncthing.net/) (for device synchronization)

### For Mobile Development

- **iOS**: Xcode 14+ and CocoaPods
- **Android**: Android Studio and Android SDK

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/megancooper/librarydock.git
cd librarydock
```

### 2. Install Dependencies

```bash
npm install
```

This will install dependencies for all apps and packages in the monorepo.

### 3. Development

Run all apps in development mode:

```bash
npm run dev
```

Or run individual apps:

```bash
# Web app (runs on http://localhost:3000)
cd apps/web
npm run dev

# API server (runs on http://localhost:3001)
cd apps/api
npm run dev

# Mobile app
cd apps/mobile
npm run start
# Then run on iOS/Android:
npm run ios
# or
npm run android
```

### 4. Build for Production

Build all apps:

```bash
npm run build
```

Or build individual apps:

```bash
cd apps/web && npm run build
cd apps/api && npm run build
```

## Configuration

### Environment Variables

#### Web App (`apps/web/.env`)

```env
VITE_API_URL=http://localhost:3001
```

#### API Server (`apps/api/.env`)

```env
PORT=3001
SYNCTHING_URL=http://localhost:8384
SYNCTHING_DEVICE_ID=your-device-id
SYNCTHING_FOLDER_ID=librarydock
SYNCTHING_API_KEY=your-api-key
```

### Setting up Syncthing

1. Install Syncthing from [syncthing.net](https://syncthing.net/)
2. Start Syncthing and access the web interface at `http://localhost:8384`
3. Create a folder for LibraryDock ebooks
4. Get your Device ID and API key from Syncthing settings
5. Configure the API server with your Syncthing credentials

## Project Structure

```
librarydock/
├── apps/
│   ├── api/                 # Hono.js API server
│   │   ├── src/
│   │   │   ├── routes/      # API route handlers
│   │   │   └── index.ts     # Server entry point
│   │   └── package.json
│   ├── mobile/              # React Native app
│   │   ├── src/
│   │   │   ├── components/  # Mobile components
│   │   │   └── App.tsx      # App entry point
│   │   └── package.json
│   └── web/                 # React web app
│       ├── src/
│       │   ├── components/  # React components
│       │   └── App.tsx      # App entry point
│       └── package.json
├── packages/
│   ├── tsconfig/            # Shared TypeScript configs
│   └── types/               # Shared type definitions
├── package.json             # Root package.json
└── turbo.json              # Turborepo configuration
```

## API Endpoints

### Ebooks

- `GET /api/ebooks` - Get all ebooks
- `GET /api/ebooks/:id` - Get specific ebook
- `POST /api/ebooks/upload` - Upload new ebook
- `PUT /api/ebooks/:id` - Update ebook metadata
- `DELETE /api/ebooks/:id` - Delete ebook

### Sync

- `GET /api/sync/status` - Get current sync status
- `POST /api/sync/trigger` - Trigger manual sync
- `GET /api/sync/config` - Get Syncthing configuration
- `POST /api/sync/config` - Update Syncthing configuration
- `GET /api/sync/devices` - Get connected devices
- `POST /api/sync/webhook` - Syncthing webhook endpoint

## Technologies Used

- **Turborepo**: High-performance build system for monorepos
- **React 18**: Web and mobile UI
- **TypeScript**: Type-safe development
- **Vite**: Fast web development and building
- **React Native**: Cross-platform mobile development
- **Hono.js**: Lightweight, fast web framework
- **Syncthing**: Decentralized file synchronization

## Development Workflow

1. Make changes to any app or package
2. The development server will hot-reload automatically
3. Run `npm run lint` to check for code issues
4. Run `npm run build` to test production builds
5. Commit your changes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Roadmap

- [ ] Authentication and user management
- [ ] Reading progress tracking
- [ ] Collections and tags
- [ ] Search and filtering
- [ ] Book metadata fetching from online sources
- [ ] Built-in ebook reader
- [ ] Cloud storage integration options
- [ ] Desktop application (Electron)

## Support

For issues and questions, please open an issue on GitHub.