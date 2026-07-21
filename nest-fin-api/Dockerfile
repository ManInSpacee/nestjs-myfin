FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY . .

RUN npx prisma generate
RUN npm run build
RUN chmod +x entrypoint.sh


ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/src/main"]

EXPOSE 3000
