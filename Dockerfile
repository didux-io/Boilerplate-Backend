FROM node:14.15.0

ENV PORT 80
# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

RUN npm run build
# If you are building your code for production
# RUN npm ci --only=production

EXPOSE 80
CMD [ "node", "build/main/index.js" ]
