FROM node:21
WORKDIR /app
COPY package.json .
COPY . . 
RUN npm install
EXPOSE 80
CMD ["node","dist/index"]