# 1. Use an official Node.js base image
FROM node:20-alpine

# 2. Set the working directory
WORKDIR /app

# 3. Copy package.json and package-lock.json first for caching
COPY package.json ./
# Use `npm ci` (clean install) if you have a package-lock.json
RUN npm install

# 4. Copy the rest of your frontend code
COPY . .

# 5. Expose the Next.js port
EXPOSE 3000

# 6. Default command to run for development
CMD ["npm", "run", "dev"]