# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies needed for Vite build)
RUN npm install

# Copy all source code
COPY . .

# Build production assets (Vite dist)
RUN npm run build

# Production Runtime Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled frontend dist from builder
COPY --from=builder /app/dist ./dist

# Copy backend server and essential configuration/assets
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/admin_credentials.json ./
COPY --from=builder /app/assets ./assets

# Expose port (Back4App & Docker platforms will bind process.env.PORT)
EXPOSE 3000

# Start server
CMD ["npm", "start"]