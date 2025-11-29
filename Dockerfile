# Multi-stage Dockerfile for Next.js (production)
# Uses Next standalone output to keep the final image minimal

# ---- Dependencies & Build ----
FROM node:24-alpine AS deps

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---- Builder ----
FROM node:24-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies) for build
RUN npm ci

# Copy source code
COPY . .

# Environment variables will be provided at runtime via docker-compose.yml

# Generate Prisma Client with correct binary targets
RUN npx prisma generate

# Build the application (standalone mode)
RUN npm run build

# ---- Runtime ----
FROM node:24-alpine AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Environment variables will be provided at runtime via docker-compose.yml

# Copy public directory (create empty one if source is empty)
COPY --from=builder /app/public ./public

# Copy standalone output (includes minimal dependencies)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Start the application using standalone server
CMD ["node", "server.js"]