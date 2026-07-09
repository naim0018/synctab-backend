FROM node:22-alpine

# Create app directory
WORKDIR /app

# Install openssl (required for Prisma on alpine)
RUN apk add --no-cache openssl

# Copy package files, Prisma schema, and Prisma config
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# Expose the API port
EXPOSE 3000

# Start the server (and push the schema to the database first)
CMD ["sh", "-c", "npx prisma db push && npm run start:prod"]
