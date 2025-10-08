# Stage 1: Build frontend (Vite React)
FROM node:20 AS frontend-builder

WORKDIR /app

# Copy entire client folder to /app/client
COPY client ./client
COPY shared ./shared
COPY package.json package-lock.json ./

# Install frontend dependencies and build
RUN cd client && npm install
RUN cd client && npm run build

# Stage 2: Build backend
FROM node:20 AS backend-builder

WORKDIR /app

# Copy backend and shared code
COPY server ./server
COPY shared ./shared
COPY package.json package-lock.json ./

# Install backend dependencies
RUN npm install

# Stage 3: Production container
FROM node:20-slim

WORKDIR /app

# Copy frontend build artifacts
COPY --from=frontend-builder /app/client/dist ./client/dist

# Copy backend files and node_modules
COPY --from=backend-builder /app/server ./server
COPY --from=backend-builder /app/shared ./shared
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/package.json ./

# Copy .env file if needed (optional)
COPY .env .env

EXPOSE 5000

# Serve backend (Express) which also serves frontend
CMD ["node", "server/index.js"]
# Or if using tsx runtime: CMD ["npx", "tsx", "server/index.ts"]
