FROM node:8.12.0

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

RUN npm run build
# If you are building your code for production
# RUN npm ci --only=production

EXPOSE 4005
CMD [ "node", "build/main/index.js" ]
