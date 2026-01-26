# Multi-stage build for backend
# Stage 1: Build
# checkov:skip=CKV_DOCKER_7: Base image uses specific version tag (24.13.0-r1-dev) via ARG, not 'latest'
ARG NODEJS_VERSION=24.13.0-r1
FROM raphaelmoraes/digital-step-flow-base-node:${NODEJS_VERSION}-dev AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: Production
# checkov:skip=CKV_DOCKER_7: Base image uses specific version tag (24.13.0-r1) via ARG, not 'latest'
FROM raphaelmoraes/digital-step-flow-base-node:${NODEJS_VERSION}

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Change ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/index.js"]
