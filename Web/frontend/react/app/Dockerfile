# react Dockerfile
ARG NODE_VERSION=22.13.0-alpine
FROM node:${NODE_VERSION}

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 5173

# Run React app
CMD ["npm", "run", "dev"]
