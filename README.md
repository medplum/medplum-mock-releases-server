# Medplum Release Server

A lightweight Express server that mimics the GitHub release manifest API for testing Medplum Agent upgrades and related features.

## Overview

This server provides a simplified implementation of GitHub's release manifest API specifically designed for testing Medplum features that depend on release information, such as the Medplum Agent auto-upgrader. It creates dynamic release manifests based on installer files in a local directory, making it easy to test upgrade flows without needing to publish actual GitHub releases.

## Features

- Generates `latest.json` and `all.json` endpoints that match GitHub's release manifest format
- Dynamically discovers installer files based on semantic versioning in filenames
- Serves installer files directly for download
- Built with TypeScript for type safety and maintainability
- Lightweight and easy to configure

## Installation

```bash
# Clone the repository
git clone https://github.com/medplum/medplum-mock-releases-server.git
cd medplum-mock-releases-server

# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

## Usage

### Adding Release Files

1. Place your Medplum Agent installer files in the `releases` directory
2. Files must follow the naming pattern: `medplum-agent-installer-x.y.z.exe` where `x.y.z` is the semantic version

Example:

```
releases/
  ├── medplum-agent-installer-4.0.1.exe
  ├── medplum-agent-installer-4.0.2.exe
  └── medplum-agent-installer-4.0.3.exe
```

### Starting the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# With custom base URL
BASE_URL=https://releases.example.com npm start

# With custom port and base URL
PORT=8080 BASE_URL=https://releases.example.com npm start
```

The server runs on port 5001 by default. You can change this by setting the `PORT` environment variable.

### Environment Variables

- `PORT`: The port on which the server listens (default: 5001)
- `BASE_URL`: The base URL used for constructing absolute URLs in the response (default: `http://localhost:{PORT}`)
  - Example: If `BASE_URL=https://releases.example.com`, download URLs will be `https://releases.example.com/releases/download/medplum-agent-installer-4.0.3.exe`

### API Endpoints

- **GET `/releases/all.json`** - Returns information about all releases in the format:

  ```json
  {
    "versions": [
      {
        "tag_name": "v4.0.3",
        "version": "4.0.3",
        "published_at": "2025-03-06T00:58:58Z",
        "assets": [
          {
            "name": "medplum-agent-installer-4.0.3.exe",
            "browser_download_url": "http://localhost:5001/releases/download/medplum-agent-installer-4.0.3.exe"
          }
        ]
      }
    ]
  }
  ```

- **GET `/releases/latest.json`** - Returns information about the latest release (highest version)

  ```json
  {
    "tag_name": "v4.0.3",
    "version": "4.0.3",
    "published_at": "2025-03-06T00:58:58Z",
    "assets": [
      {
        "name": "medplum-agent-installer-4.0.3.exe",
        "browser_download_url": "http://localhost:5001/releases/download/medplum-agent-installer-4.0.3.exe"
      }
    ]
  }
  ```

- **GET `/releases/download/:filename`** - Downloads the specified installer file

## Testing Medplum Agent Upgrades

To test the Medplum Agent upgrader feature:

1. Configure your Medplum Agent to use this server as the update source instead of GitHub by building the agent with `MEDPLUM_RELEASES_URL` in `@medplum/core/src/version-utils.ts` modified
2. Add multiple versions of the installer to the `releases` directory
3. When the agent checks for updates, it will receive information from this server

## GitHub Release Manifest Compatibility

This server implements a stripped-down version of the GitHub release manifest format, focusing only on the fields required by the Medplum Agent upgrader:

- `tag_name`: The version tag (e.g., "v4.0.3")
- `version`: The semantic version without the "v" prefix (e.g., "4.0.3")
- `published_at`: The timestamp when the release was published
- `assets`: Array of downloadable files associated with the release

The implementation is intentionally simplified to focus on the specific needs of Medplum-related testing.

## Development

### Project Structure

```
medplum-mock-releases-server/
├── src/
│   └── index.ts       # Main TypeScript file
├── dist/              # Compiled JavaScript (generated)
├── releases/          # Directory for installer files
├── package.json       # Dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

### Modifying the Server

If you need to extend functionality or add custom behavior:

1. Modify the TypeScript code in `src/index.ts`
2. Rebuild with `npm run build`
3. Restart the server

## License

[Apache 2.0](LICENSE.txt)
