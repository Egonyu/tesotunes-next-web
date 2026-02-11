ARG NODE_VERSION=22

# Builder stage: Build Next.js app
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage: Minimal standalone deployment
FROM node:${NODE_VERSION}-alpine

WORKDIR /app

RUN apk add --no-cache curl dumb-init

# Copy only standalone output (minimal dependencies)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create app user for security (use different UID/GID to avoid conflicts)
RUN addgroup -g 3000 -S app && adduser -u 3000 -S app -G app
RUN chown -R app:app /app

USER app

EXPOSE 3000

# Health check (Next.js binds to 0.0.0.0 in standalone mode)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://127.0.0.1:3000 || wget -q --spider http://127.0.0.1:3000 || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
