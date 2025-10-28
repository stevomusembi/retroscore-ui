# Stage 1: Build the web app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Using npm ci for cleaner, faster, more reliable installs
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the web app
RUN npx expo export --platform web

# Stage 2: Serve the built app with Nginx
FROM nginx:alpine

# Copy the built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]