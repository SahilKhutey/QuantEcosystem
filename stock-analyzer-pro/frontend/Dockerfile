FROM node:16-alpine

WORKDIR /app

COPY package.json ./
# Note: skipping package-lock.json as it might not be generated yet
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

# Correcting to serve the application if strictly following npm run dev pattern or actual build
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
