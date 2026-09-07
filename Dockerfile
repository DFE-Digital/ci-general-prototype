FROM node:18-bullseye

WORKDIR /app

ENV PATH=/app/node_modules/.bin:$PATH
ENV NODE_ENV=production
ENV USE_BROWSER_SYNC=false
ENV USE_HTTPS=true
ENV PORT=3000
ENV PASSWORD=dfe

COPY . .

RUN npm install

EXPOSE 3000

ENTRYPOINT ["npm", "run"]
CMD ["start"]
