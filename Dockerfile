FROM node:18-bullseye

WORKDIR /app

ENV PATH=/app/node_modules/.bin:$PATH
ENV NODE_ENV=production
ENV USE_AUTH=false
ENV USE_HTTPS=false
ENV USE_BROWSER_SYNC=false
ENV PORT=3000

COPY . .

RUN npm install

EXPOSE 3000

ENTRYPOINT ["npm", "run"]
CMD ["start"]
