# Stage 1: Build frontend (Vite React)
FROM node:20 AS frontend-builder

WORKDIR /app

COPY client/package.json ./client/
COPY client/ ./client/

# Generate package-lock.json inside Docker by installing dependencies
RUN cd client && npm install

# Build the frontend
RUN cd client && npm run build
COPY shared ./shared
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/

# Install frontend deps & build
RUN cd client \
    && npm install \
    && npm run build

# Stage 2: Build backend
FROM node:20 AS backend-builder

WORKDIR /app
COPY server ./server
COPY shared ./shared
COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/

# Install backend deps
RUN npm install

# Stage 3: Production container
FROM node:20-slim

WORKDIR /app

# Copy build artifacts from frontend
COPY --from=frontend-builder /app/client/dist ./client/dist

# Copy backend, shared, and node_modules
COPY --from=backend-builder /app/server ./server
COPY --from=backend-builder /app/shared ./shared
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/package.json ./

# Copy .env from build context (optional: remove if using secrets manager)
COPY .env .env

# Expose backend port (e.g., 5000)
EXPOSE 5000

# Start the backend server
CMD ["node", "server/index.js"]
# Or, if using TypeScript/tsx: CMD ["npx", "tsx", "server/index.ts"]
