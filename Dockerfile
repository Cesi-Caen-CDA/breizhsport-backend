# Utilise une image Node.js officielle basée sur Alpine
FROM node:20-alpine

# Définit le répertoire de travail
WORKDIR /usr/src/app

# Installe les outils nécessaires pour compiler les modules natifs
RUN apk add --no-cache bash python3 make g++

# Copie les fichiers package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances (en utilisant la suppression des caches npm pour éviter les erreurs)
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copie le reste des fichiers de l'application
COPY . .

# Compile l'application si nécessaire
RUN npm run build

# Expose le port sur lequel NestJS fonctionne
EXPOSE 3000

# Commande pour démarrer l'application en mode développement
CMD ["npm", "run", "start:dev"]
