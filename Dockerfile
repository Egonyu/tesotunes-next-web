ARG NODE_VERSION=22

# Builder stage: Build Next.js app
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY . .

# Install dependencies and build Next.js
RUN npm ci && npm run build

# Runtime stage: Nextjs built-in server
FROM node:${NODE_VERSION}-alpine

WORKDIR /app

RUN apk add --no-cache curl dumb-init

# Copy built app and node_modules from builder  
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package*.json ./

# Create app user for security
RUN addgroup -g 1000 -S app && adduser -u 1000 -S app -G app
RUN chown -R app:app /app

USER app

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
