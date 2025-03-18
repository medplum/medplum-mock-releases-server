import cors from "cors";
import express, { type Request, type Response } from "express";
import fs from "node:fs";
import path from "node:path";
import semver from "semver";

// Interfaces
interface Asset {
  name: string;
  browser_download_url: string;
}

interface Release {
  tag_name: string;
  version: string;
  published_at: string;
  assets: Asset[];
}

interface AllReleasesResponse {
  versions: Release[];
}

// Constants
const app = express();
const port = process.env.PORT || 5001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${port}`;
const RELEASES_DIR = path.join(__dirname, "../releases");

app.use(cors());

// Ensure the releases directory exists
if (!fs.existsSync(RELEASES_DIR)) {
  fs.mkdirSync(RELEASES_DIR, { recursive: true });
}

// Helper function to extract version from filename
function extractVersion(filename: string): string | null {
  const match = filename.match(/medplum-agent-installer-(\d+\.\d+\.\d+)\.exe/);
  return match ? match[1] : null;
}

// Helper function to generate release data
function generateReleaseData(): Release[] {
  const files = fs.readdirSync(RELEASES_DIR);
  const releases: Release[] = [];

  for (const file of files) {
    const version = extractVersion(file);
    if (version) {
      const stats = fs.statSync(path.join(RELEASES_DIR, file));
      const publishedAt = stats.mtime.toISOString();

      releases.push({
        tag_name: `v${version}`,
        version: version,
        published_at: publishedAt,
        assets: [
          {
            name: file,
            browser_download_url: `${BASE_URL}/releases/download/${file}`,
          },
        ],
      });
    }
  }

  // Sort releases by semver (descending)
  releases.sort((a, b) => {
    if (semver.gt(a.version, b.version)) return -1;
    if (semver.lt(a.version, b.version)) return 1;
    return 0;
  });

  return releases;
}

// Endpoint for all.json
app.get("/releases/all.json", (req: Request, res: Response) => {
  const releases = generateReleaseData();
  const response: AllReleasesResponse = { versions: releases };
  res.json(response);
});

// Endpoint for latest.json
app.get("/releases/latest.json", (req: Request, res: Response) => {
  const releases = generateReleaseData();
  if (releases.length > 0) {
    res.json(releases[0]); // First release is the latest (after sorting)
  } else {
    res.status(404).json({ error: "No releases found" });
  }
});

// Serve static files from the releases directory
app.get("/releases/download/:filename", (req: Request, res: Response) => {
  const filePath = path.join(RELEASES_DIR, req.params.filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Release server listening on port ${port}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Serving releases from: ${RELEASES_DIR}`);
});
