# Usando a imagem oficial do Node.js
FROM node:18-alpine as build

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install --force

# Copia o restante dos arquivos
COPY . .

# Gera a build da aplicação React
RUN npm run build

# Usando a imagem oficial do Nginx
FROM nginx:stable-alpine

# Copia os arquivos da build do React para o diretório padrão do Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copia a configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expondo a porta 80
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
