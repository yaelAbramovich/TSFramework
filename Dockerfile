# Keep this tag in sync with the installed @playwright/test version (npm ls @playwright/test)
FROM mcr.microsoft.com/playwright:v1.62.1-noble

WORKDIR /app

# Install dependencies first so this layer is cached until package files change
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Reports/traces are written here; make them writable for the non-root user
RUN mkdir -p playwright-report test-results && chown -R pwuser:pwuser /app
USER pwuser

ENV CI=true

CMD ["npm", "test"]
