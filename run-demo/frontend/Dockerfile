FROM node:20.16.0-slim

WORKDIR /usr/src/app

# install dependencies according to package-lock.json
COPY package*.json ./
RUN npm clean-install

# copy the rest of the files
COPY . .

CMD [ "npm", "run", "dev" ]
