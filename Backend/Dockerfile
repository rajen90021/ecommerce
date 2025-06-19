# Use official Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy app code
COPY . .

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Expose backend port
EXPOSE 6000

# Use the custom entrypoint
ENTRYPOINT ["./entrypoint.sh"]
