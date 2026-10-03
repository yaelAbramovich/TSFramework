# mcr.microsoft.com/playwright ships Chromium/Firefox/WebKit and their OS
# dependencies already installed, matched to the exact @playwright/test
# version below - no `playwright install` step needed in this image.
# Keep this tag in sync with the "@playwright/test" version in package.json.
FROM mcr.microsoft.com/playwright:v1.62.1-noble

WORKDIR /app

# Installed before copying the rest of the source so this layer only
# re-runs when dependencies actually change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# BASE_URL / API_BASE_URL are read from process.env by src/config/environment.ts
# - pass them at `docker run` time (-e or --env-file), never bake a real
# environment's URL into this image. See README for the exact commands.
CMD ["npx", "playwright", "test"]
