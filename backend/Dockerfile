FROM node:20-slim

# Instalar OpenSSL y certificados necesarios para Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar manifiestos y esquema de Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias y compilar cliente de Prisma para Linux Debian
RUN npm install
RUN npx prisma generate

# Copiar el código fuente restante
COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]