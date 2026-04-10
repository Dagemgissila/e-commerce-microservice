FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

COPY .env .env
# Generate Prisma client
RUN npx prisma generate

EXPOSE 4002

CMD ["npm", "run", "dev"]
