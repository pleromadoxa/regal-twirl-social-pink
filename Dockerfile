# Use a lightweight Node.js base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run your app
CMD ["node", "dist/index.js"]
