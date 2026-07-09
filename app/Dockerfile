FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY server.js ./
COPY index.html ./

ENV PORT=6000
EXPOSE 6000

CMD ["node", "server.js"]
