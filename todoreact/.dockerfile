# build environment
FROM node:13.12.0-alpine as build
WORKDIR /app
COPY ./build /app

# production environment
RUN npm install -g serve
CMD ["serve", '-l', '9999', '-s', '/app']