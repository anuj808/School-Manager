FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Use non-root user for security
USER node

# Expose port and start application
EXPOSE 5000
CMD [ "node", "index.js" ]
