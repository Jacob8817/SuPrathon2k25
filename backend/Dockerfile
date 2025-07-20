# 1) Base image
FROM node:18-slim

# 2) Install PDF tool
RUN apt-get update && \
    apt-get install -y poppler-utils && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 3) Working directory
WORKDIR /app

# 4) Copy dependency manifests
COPY package*.json ./

# 5) Set environment for production
ENV NODE_ENV=production

# 6) Install only production dependencies
RUN npm ci --only=production

# 7) Copy the rest of the app
COPY . .

# 8) Expose dynamic port
EXPOSE 3000

# 9) Start server
CMD ["node", "server.js"]
