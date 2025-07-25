FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts

COPY ./src/server.js .

USER node

EXPOSE 80
CMD ["npm", "start"]
