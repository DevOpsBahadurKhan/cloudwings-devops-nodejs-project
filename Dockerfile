# Use specific Node.js version
FROM node:20.15.0

# Set working directory inside container
WORKDIR /usr/src/app

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Expose the port on which the application will run
EXPOSE $PORT

# Run the application
CMD ["node", "app.js"]
