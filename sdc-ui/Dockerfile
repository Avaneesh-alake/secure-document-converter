# sdc-ui/Dockerfile
# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Make sure build uses the env set by docker-compose
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy the built app + needed files
COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "run", "start"]
