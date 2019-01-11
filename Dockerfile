FROM node:alpine

WORKDIR /usr/intrachat

RUN npm install -g nodemon

COPY ./package.json .
COPY ./webpack.config.js .
COPY ./.babelrc .

RUN npm install

WORKDIR /usr/intrachat/server

