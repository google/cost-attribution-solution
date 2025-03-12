# Use an official Node.js runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code to the working directory
COPY . .

# Build the angular application development
RUN npm run build --configuration development

# Build the angular application production
# RUN npm run build

# Expose the port that your application listens on
EXPOSE 8080

# Command to run the application
CMD ["npx", "-y", "serve", "-s", "dist/tag-automator-frontend/browser", "-l", "8080"]