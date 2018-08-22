FROM node:8

COPY . /app
WORKDIR /app
RUN npm install
ENTRYPOINT npm test
