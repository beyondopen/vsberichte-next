FROM node:22-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Statically prerendered pages bake this in at build time
# (pass --build-arg ANALYTICS_ENABLED=true to enable Matomo)
ARG ANALYTICS_ENABLED
ENV ANALYTICS_ENABLED=$ANALYTICS_ENABLED
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# uid/gid 32767 matches the Dokku storage-mount convention so the app
# can write to mounted volumes (e.g. Payload media uploads)
RUN addgroup --system --gid 32767 nodejs
RUN adduser --system --uid 32767 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
