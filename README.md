# Pré-requis

- Un compte MongoDB Atlas avec une base de donnée disponible (https://cloud.mongodb.com/).
- nodejs.

# Configuration

Encodeur de caractères disponible pour la clé secrête JWT (https://www.javainuse.com/jwtgenerator).

## Dans un fichier .env (à créer si non disponible), à la racine de /backend, ajouter et définir les variables suivantes:

JWT_SECRET = {{CLE_SECRETE}}

DB_USER = {{NOM_UTILISATEUR_BDD_MONGODB_ATLAS}}

DB_PASS= {{MOT_DE_PASSE_UTILISATEUR_BDD_MONGODB_ATLAS}}

DB_NAME= {{NOM_DU_CLUSTER_BDD_MONGO_DB_ATLAS}}

# Utilisation

## Lancer le Backend

Dans un terminal, à partir du dossier /backend du projet, lancer 'npm start'

## Lancer le Frontend

Dans un autre terminal, à partir du dossier /frontent du projet, lancer 'npm start'

## Accéder à l'application
Dans un navigateur, accéder à l'url 'http://localhost:4200/'