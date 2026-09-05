# Stage 1: Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for building)
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and TypeScript configuration
COPY tsconfig.json ./
COPY src ./src/

# Compile TypeScript to JavaScript in /dist
RUN npm run build

# Stage 2: Production Runtime Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy package files and install only production dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --only=production && npx prisma generate

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# Expose API Port
EXPOSE 5000

# Start server
CMD ["node", "dist/server.js"]
