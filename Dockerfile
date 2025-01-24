FROM node:22

# Set the working directory inside the container
WORKDIR /data

# Copy package.json only (no package-lock.json initially)
COPY package.json ./

# Install dependencies (generates package-lock.json if it doesn't exist)
RUN npm install

# Copy specific folders and files from the host to the container
# COPY . .

# Expose Remix's default port
EXPOSE 3000

# Default command to start the Remix development server
CMD ["npm", "run", "dev"]