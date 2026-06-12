FROM node:22.19.0-slim

WORKDIR /usr/src/app

# install dependencies according to package-lock.json
COPY package*.json ./
RUN npm clean-install

# copy the rest of the files
COPY . .

# Build at container startup (using runtime env vars) and serve static output.
# This avoids Vite dev-server optimized deps under /node_modules/.vite/deps.
CMD [ "sh", "-c", "npm run build && npm run preview -- --host 0.0.0.0 --port 5173" ]
