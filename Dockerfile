# Utilise une image Node.js officielle
FROM node:18-alpine

# Définit le répertoire de travail
WORKDIR /usr/src/app

# Copie les fichiers package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste des fichiers de l'application
COPY . .

# Compile le projet (si TypeScript est utilisé)
RUN npm run build

# Expose le port sur lequel NestJS fonctionne (par défaut 3000)
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "run", "start:prod"]
