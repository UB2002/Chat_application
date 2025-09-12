FROM node:20-alpine

WORKDIR /app 

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5173

# CMD [ "npm", "run", "dev" ]
CMD ["npm", "run", "dev", "--", "--host"]