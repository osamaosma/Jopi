FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY --chown=node:node worker.mjs verify-video.mjs ./

USER node

CMD ["node", "worker.mjs"]