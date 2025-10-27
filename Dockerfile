# ---- Stage 1: Build ----
FROM node:22-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory
WORKDIR /usr/src/app

# Copy dependency manifests
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev)
RUN pnpm install

# Copy all source files
COPY . .

# Build TypeScript into dist/
RUN pnpm run build


# ---- Stage 2: Production ----
FROM node:22-alpine AS production

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /usr/src/app

# Copy only needed files from builder
COPY package.json pnpm-lock.yaml typeorm-cli.js wait-for-db.sh ./
# RUN pnpm install --prod
RUN pnpm install --prod && pnpm add typeorm ts-node


COPY --from=builder /usr/src/app/dist ./dist
