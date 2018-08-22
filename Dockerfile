FROM node:8

COPY . /app
WORKDIR /app
RUN npm install
ENV GRPC_VERBOSITY=debug
ENV GRPC_TRACE=api,client_channel,connectivity_state
CMD npm test
