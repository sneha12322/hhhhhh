FROM node:20-alpine AS builder

WORKDIR /app

# Install dumb-init and build dependencies
RUN apk add --no-cache dumb-init python3 make g++

# Copy package files
COPY package*.json ./

# Install all deps for build, using legacy peer deps for React 19 compatibility
RUN npm ci --legacy-peer-deps

# Copy project files and build
COPY . .
RUN npm run build && ls -la dist/ && ls -la frontend/dist/

FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy only production dependencies and built output
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/frontend/dist ./frontend/dist

# Create directory for database
RUN mkdir -p database && \
    chmod 755 database

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
