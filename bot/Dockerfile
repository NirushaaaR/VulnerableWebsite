FROM buildkite/puppeteer:latest

ENV  PATH="${PATH}:/node_modules/.bin"

RUN mkdir /app
COPY index.js /app/index.js


RUN node /app/index.js