FROM node:8

COPY . /app
WORKDIR /app
RUN npm install
ENV GRPC_VERBOSITY=debug
ENV GRPC_TRACE=connectivity_state,tcp
CMD npm test
