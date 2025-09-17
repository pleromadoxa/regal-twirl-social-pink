# Use a lightweight Node.js base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install project dependencies, and also install the `serve` package globally
RUN npm install && npm install -g serve

# Copy the rest of your application code
COPY . .

# Build the application
# This is crucial! Make sure your build script actually creates the `dist` folder.
RUN npm run build

# Expose the port the server will run on
EXPOSE 8080

# Define the command to run your app
# This command tells `serve` to serve the files from the `dist` directory
CMD ["serve", "-s", "dist"]
