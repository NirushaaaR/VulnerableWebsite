# build environment
FROM node:13.12.0-alpine
WORKDIR /build
ENV PATH /build/node_modules/.bin:$PATH
COPY ./build /build

# production environment
RUN npm install -g serve
CMD serve -s /build -l 9999