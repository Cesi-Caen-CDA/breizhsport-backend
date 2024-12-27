# Utilise une image Node.js officielle
FROM node:18-alpine

# Définit le répertoire de travail
WORKDIR /usr/src/app

# Copie les fichiers package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Installe le CLI NestJS globalement pour le mode développement
RUN npm install -g @nestjs/cli

# Copie le reste des fichiers de l'application
COPY . .

# Expose le port sur lequel NestJS fonctionne (par défaut 3000)
EXPOSE 3000

# Commande pour démarrer l'application en mode développement
CMD ["npm", "run", "start:dev"]