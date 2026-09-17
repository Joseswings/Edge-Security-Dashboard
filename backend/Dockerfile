# syntax=docker/dockerfile:1
FROM node:24-alpine3.22

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3001

WORKDIR /app

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force

COPY --chown=node:node src ./src

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3001/api/status').then((response) => { if (!response.ok) throw new Error(String(response.status)); }).catch(() => process.exit(1))"]

CMD ["node", "src/server.js"]
