// Modules
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const path = require('path');

//Routes
const routesUsers= require('./routes/users');
const routesSauces = require('./routes/sauces');

// Appels
const app = express();
dotenv.config();

// MongoDb URI
const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_NAME}.pjh5nvf.mongodb.net/test?retryWrites=true&w=majority`;

mongoose.set('strictQuery', true);

mongoose.connect(mongoURI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(error => console.log(error));

//En-têtes des requêtes (Paramétré de sorte à ce que l'API soit accessible de partout et via de nombreuses méthodes)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE', 'PATCH', 'OPTIONS');
    next();
});

// Sécurisation des headers de requêtes via Helmet, en alternative à https. 
// Paramétré de sorte à ce que le CORP assouplisse son contrôle au simple nom d'hôte.
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "same-site"}));

app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth', routesUsers);
app.use('/api/sauces', routesSauces);

module.exports = app;